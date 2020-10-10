/****************************************************
 * Copyright (c) 2020 FXDaemon All Rights Reserved. *
 ****************************************************/

"use strict";

function MakeSignal(curDir, outDir, symbol, period, fromDate, toDate)
{
    var delimit = ",";
    var cal_count = 540;
    var out_count = 300;
    var time_format = "%Y%m%d%H%M%S";
    var file_ext = ".csv";

    // if per_file_size equal to -1, one file is created in a year.
    var per_file_size = -1;
    if (period.substr(0, 1) == 'm') {
        per_file_size = 1000;
    }

    var dt_start = _CDate(fromDate);
    var dt_end = _CDate(toDate);
    var dt_start_year = 0;
    var point_size = _GetPointSize(symbol);

    _Print("dt_start:%s dt_end:%s\n", fromDate, toDate);

    var period_list = period.split(delimit);
    var out_dir = curDir + outDir + symbol.replace("/", "-") + "/" + period_list[0];
    if (_Mkdir(out_dir) == -1) {
        _Print("Directory [%s] creation failed.\n", out_dir);
        return;
    }

    var fp = null;
    var file_cnt = 0;
    var total_cnt = 0;
    var period_time = _GetTimeByPeriod(period_list[0]);
    if (period_list[0].substr(0, 1) == 'H') {
        period_time = _GetTimeByPeriod('H1');
    }

    while (dt_start.time < dt_end.time) {
         if (dt_start_year != dt_start.year || file_cnt == per_file_size) {
            if (fp) {
                fp.close();
            }
            file_cnt = 0;
            dt_start_year = dt_start.year;
        }

        for (var i = 0; i < period_list.length; i++) {
            var period = period_list[i];
            var pbList = _GetPriceBarFromLocal(symbol, period, dt_start.toString(), cal_count);
            if (!pbList || pbList.length == 0) {
                _Print("GetPriceBar error. %s %s %s\n", symbol, period, dt_start.toString());
                break;
            }
            if (i== 0 && pbList[pbList.length - 1].startdate < dt_start.time) {
                var dt = _CDate(pbList[pbList.length - 1].startdate);
                _Print("GetPriceBar is small. %s < %s\n", dt.toString(), dt_start.toString());
                break;
            }

            if (file_cnt == 0) {
                var out_file = out_dir + "/" + dt_start.toString("LOCAL", time_format) + file_ext;
                fp = new _CFile(out_file);
                if (fp.open("w") == -1) {
                    _Print("[%s] file open error.\n", out_file);
                    return;
                }
                _Print("Begin write to [%s]\n", out_file);
            }

            if (i == 0) {
                file_cnt++;
                var timestamp = dt_start.toString("LOCAL", time_format);
                _Print("%s\n", timestamp);
                fp.write(timestamp + "\n");
                total_cnt++;
            }

            var askopen = _GetPriceArray(pbList, "AskOpen");
            fp.write(_Num2Str(askopen.slice(out_count * -1)).join(delimit) + "\n");
            var askclose = _GetPriceArray(pbList, "AskClose");
            fp.write(_Num2Str(askclose.slice(out_count * -1)).join(delimit) + "\n");
            var askhigh = _GetPriceArray(pbList, "AskHigh");
            fp.write(_Num2Str(askhigh.slice(out_count * -1)).join(delimit) + "\n");
            var asklow = _GetPriceArray(pbList, "AskLow");
            fp.write(_Num2Str(asklow.slice(out_count * -1)).join(delimit) + "\n");

            var macd = _TA("MACD", pbList, "AskClose", 12, 26, 9);
            fp.write(_Num2Str(ArrayDivide(macd.macd.slice(out_count * -1), point_size)).join(delimit) + "\n");
            fp.write(_Num2Str(ArrayDivide(macd.signal.slice(out_count * -1), point_size)).join(delimit) + "\n");
            fp.write(_Num2Str(ArrayDivide(macd.hist.slice(out_count * -1), point_size)).join(delimit) + "\n");

            var stoch = _TA("STOCH", pbList, "Ask", 73, 19, "TA_MAType_EMA", 19, "TA_MAType_EMA");
            fp.write(_Num2Str(stoch.slowk.slice(out_count * -1)).join(delimit) + "\n");
            fp.write(_Num2Str(stoch.slowd.slice(out_count * -1)).join(delimit) + "\n");
        }

        if (dt_start.week == 6 && dt_start.hour == 4) {
            dt_start.addinTime(2 * 24 * 3600);
            dt_start.addinTime(0 * 3600);
        }
        else {
            dt_start.addinTime(period_time);
        }
    }

    if (fp) {
        fp.close();
    }

    _Print("%d is writed.\n", total_cnt);
}
