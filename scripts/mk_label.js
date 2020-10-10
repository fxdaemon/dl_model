/****************************************************
 * Copyright (c) 2020 FXDaemon All Rights Reserved. *
 ****************************************************/

"use strict";

var delimit = " ";

function MakeLabelS1(curDir, outDir, symbol, period, fromDate, toDate, assume)
{
	var cal_count = 540;
	var stoch_over_line = 20;
	var time_format = "%Y%m%d%H%M%S";
	var file_ext = ".csv";
	assume = assume == '0' ? false : true;

	var out_dir = curDir + outDir + symbol.replace("/", "-");
	if (_Mkdir(out_dir) == -1) {
		_Print("Directory [%s] creation failed..\n", out_dir);
		return;
	}

	var lc = new LabelClassifyS1(stoch_over_line);
	lc.init();

	var dt_start = _CDate(fromDate);
	var dt_end = _CDate(toDate);
	var period_time = _GetTimeByPeriod(period);
	var non_cnt = 0;
	var buy_cnt = 0;
	var sell_cnt = 0;
	var timestamps = [];

	while (dt_start.time < dt_end.time) {
		var timestamp = dt_start.toString("LOCAL", time_format);
		_Print("%s\n", timestamp);

		var pbList = _GetPriceBarFromLocal(symbol, period, dt_start.toString(), cal_count);
		if (pbList && pbList.length > 0 && pbList[pbList.length - 1].startdate == dt_start.time) {
			var macd = _TA("MACD", pbList, "AskClose", 12, 26, 9);
			var macd_cross = GetCrossByMacdEx(macd, 0, 6, -1);

			var stoch = _TA("STOCH", pbList, "Ask", 73, 19, "TA_MAType_EMA", 19, "TA_MAType_EMA");
			var stoch_cross = GetCrossByStochEx(stoch, 0, 3, -1)

			// Create s1 label
			timestamps.push(timestamp);
			lc.classify(stoch_cross, macd_cross, assume);
		}
		else {
			if (pbList && pbList.length > 0) {
				if (pbList[pbList.length - 1].startdate < dt_start.time) {
					var dt = _CDate(pbList[pbList.length - 1].startdate);
					_Print("GetPriceBar is small. %s < %s\n", dt.toString(), dt_start.toString());
				}
			}
			else {
				_Print("GetPriceBar error. %s %s %s\n", symbol, period, dt_start.toString());
			}
		}

		if (dt_start.week == 6 && dt_start.hour == 4) {
			dt_start.addinTime(2 * 24 * 3600);
			dt_start.addinTime(0 * 3600);
		}
		else {
			dt_start.addinTime(period_time);
		}
	}

	if (timestamps.length > 0) {
		// Output the created label to a file
		var assume_str = assume ? '' : '.c1';
		var out_file = out_dir + '/' + period + '.s1' + assume_str + file_ext;
		var fp = new _CFile(out_file);
		if (fp.open("w") == -1) {
			_Print("[%s] file open error.\n", out_file);
			return;
		}

		_Print("Begin write to [%s]\n", out_file);
		lc.close();
		timestamps.forEach((timestamp, idx) => {
			var label = "";
			label = label.concat(delimit, lc.labels[idx]);
			fp.write(timestamp + label + "\n");
		});
		fp.close();

		_Print("none:%d buy:%d sell:%d\n", lc.non_cnt, lc.buy_cnt, lc.sell_cnt);
		non_cnt += lc.non_cnt;
		buy_cnt += lc.buy_cnt;
		sell_cnt += lc.sell_cnt;
	}

	_Print("Finished. ==> [total:%d none:%d buy:%d sell:%d]\n", timestamps.length, non_cnt, buy_cnt, sell_cnt);
}


function MakeLabelS2(curDir, inPath, symbol, period, plmin, plmax, plnum)
{
	var point_size = _GetPointSize(symbol);
	var pl_min = parseInt(plmin);
	var pl_max = parseInt(plmax);
	var pl_num = parseInt(plnum);
	var scan_lst = ["s1", "s2", "s2a"];

	// Generate output directory and output file name
	var outDir = curDir;
	var outFilename = inPath;
	var pos = inPath.lastIndexOf('/');
	if (pos == -1) {
		pos = inPath.lastIndexOf('\\');
	}
	if (pos >= 0) {
		outDir = curDir + inPath.substr(0, pos + 1);
		outFilename = inPath.substr(pos + 1);
	}
	var scan_level = scan_lst.length - 1;
	while (scan_level >= 0) {
		if (outFilename.indexOf(scan_lst[scan_level]) >= 0) {
			break;
		}
		scan_level--;
	}
	if (scan_level < 0) {
		_Print("Scan level error.\n");
		return;
	}
	// Change file name
	var p_exist = false, n_exist = false;
	var fns = outFilename.split('.');
	for (var i = 0; i < fns.length; i++) {
		var prefix = fns[i].substr(0, 1);
		if (prefix == 's') {
			fns[i] = scan_lst[scan_level + 1];
		}
		else if (prefix == 'p') {
			fns[i] = 'p' + plmin + (plmax.length > 0 ? '_' + plmax : '');
			p_exist = true;
		}
		else if (prefix == 'n') {
			fns[i] = 't' + plnum;
			n_exist = true;
		}
	}
	if (!n_exist) {
		fns.splice(fns.length - 1, 0, 't' + plnum);
	}
	if (!p_exist) {
		fns.splice(fns.length - 2, 0, 'p' + plmin + (plmax.length > 0 ? '_' + plmax : ''));
	}
	outFilename = fns.join('.');

	var lc = new LabelClassifyS2(pl_min, pl_max, pl_num, point_size);
	lc.init();

	// Import s1 label from file
	var fp = new _CFile(inPath);
	if (fp.open() == -1) {
		_Print("[%s] file open error.\n", inPath);
		return;
	}
	var line, timestamps = [];
	while (line = fp.readline()) {
		var s = line.split(delimit);
		timestamps.push(s[0]);
		lc.labels.push(s[1]);
	}
	fp.close();

	// Count labels before update
	_Print("[%s]\n", scan_lst[scan_level]);
	lc.count();
	_Print(" total:%d none:%d buy:%d sell:%d\n", 
		lc.non_cnt + lc.buy_cnt + lc.sell_cnt,
		lc.non_cnt, lc.buy_cnt, lc.sell_cnt);

	// Create s2 label
	lc.classify(symbol, period, timestamps);

	// Output the created label to a file
	var out_file = outDir + outFilename;
	var fp = new _CFile(out_file);
	if (fp.open("w") == -1) {
		_Print("[%s] file open error.\n", out_file);
		return;
	}
	_Print("Begin write to [%s]\n", out_file);
	timestamps.forEach((timestamp, idx) => {
		var label = "";
		label = label.concat(delimit, lc.labels[idx]);
		fp.write(timestamp + label + "\n");
	});
	fp.close();

	// Count updated labels
	_Print("[%s]\n", scan_lst[scan_level + 1]);
	lc.count();
	_Print(" total:%d none:%d buy:%d sell:%d\n", 
		lc.non_cnt + lc.buy_cnt + lc.sell_cnt,
		lc.non_cnt, lc.buy_cnt, lc.sell_cnt);
}


function MakeLabelS3(curDir, inPath, symbol, period)
{
	var point_size = _GetPointSize(symbol);
	var scan_lst = ["s2", "s3", "s3a"];

	// Generate output directory and output file nam
	var outDir = curDir;
	var outFilename = inPath;
	_Print(outFilename);
	var pos = inPath.lastIndexOf('/');
	if (pos == -1) {
		pos = inPath.lastIndexOf('\\');
	}
	if (pos >= 0) {
		outDir = curDir + inPath.substr(0, pos + 1);
		outFilename = inPath.substr(pos + 1);
	}
	var scan_level = scan_lst.length - 1;
	while (scan_level >= 0) {
		if (outFilename.indexOf(scan_lst[scan_level]) >= 0) {
			break;
		}
		scan_level--;
	}
	if (scan_level < 0) {
		_Print("Scan level error.\n");
		return;
	}

	// Change file name
	var fns = outFilename.split('.');
	for (var i = 0; i < fns.length; i++) {
		var prefix = fns[i].substr(0, 1);
		if (prefix == 's') {
			fns[i] = scan_lst[scan_level + 1];
		}
	}
	outFilename = fns.join('.');

	var lc = new LabelClassifyS3();
	lc.init();

	// Import s2 label from file
	var fp = new _CFile(inPath);
	if (fp.open('r') == -1) {
		_Print("[%s] file open error.\n", inPath);
		return;
	}
	var line, timestamps = [];
	while (line = fp.readline()) {
		var s = line.split(delimit);
		timestamps.push(s[0]);
		lc.labels.push(s[1]);
	}
	fp.close();

	// Remove s2 label information
	if (scan_lst[scan_level] == "s2") {
		lc.clean();
	}

	// Summary label information
	lc.summary(symbol, period, timestamps);

	// Output the created label to a file
	var out_file = outDir + outFilename;
	var fp = new _CFile(out_file);
	if (fp.open("w") == -1) {
		_Print("[%s] file open error.\n", out_file);
		return;
	}
	_Print("Begin write to [%s]\n", out_file);
	timestamps.forEach((timestamp, idx) => {
		var label = "";
		label = label.concat(delimit, lc.labels[idx]);
		fp.write(timestamp + label + "\n");
	});
	fp.close();

	// Output counted label information
	_Print("[%s]\n", 's3');
	_Print(" total:%d none:%d buy:%d sell:%d\n", 
		lc.non_cnt + lc.buy_cnt + lc.sell_cnt,
		lc.non_cnt, lc.buy_cnt, lc.sell_cnt);
	_Print("    buy_min_count:%-5d       buy_max_count:%-5d\n", lc.buy_min_count, lc.buy_max_count);
	_Print("    sell_min_count:%-5d      sell_max_count:%-5d\n", lc.sell_min_count, lc.sell_max_count);
	_Print("    non_diff_min_count:%-5d  non_diff_max_count:%-5d\n", lc.non_diff_min_count, lc.non_diff_max_count);
	_Print("    non_same_min_count:%-5d  non_same_max_count:%-5d\n", lc.non_same_min_count, lc.non_same_max_count);
}

