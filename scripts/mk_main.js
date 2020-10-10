/****************************************************
 * Copyright (c) 2020 FXDaemon All Rights Reserved. *
 ****************************************************/

(function() {

    "use strict";

    var curDir = _Params.curPath;
    var mk_method = _Params.param1;

    if (mk_method == "mk_signal") {
        var outDir = _Params.param2;
        var symbol = _Params.param3;
        var period = _Params.param4;
        var fromDate = _Params.param5;
        var toDate = _Params.param6;
        MakeSignal(curDir, outDir, symbol, period, fromDate, toDate);
    }
    else if (mk_method == "mk_label_s1") {
        var outDir = _Params.param2;
        var symbol = _Params.param3;
        var period = _Params.param4;
        var fromDate = _Params.param5;
        var toDate = _Params.param6;
        var assume = _Params.param7;
        MakeLabelS1(curDir, outDir, symbol, period, fromDate, toDate, assume);
    }
    else if (mk_method == "mk_label_s2") {
        var inPath = _Params.param2;
        var symbol = _Params.param3;
        var period = _Params.param4;
        var plmin = _Params.param5;
        var plmax = _Params.param6;
        var plnum = _Params.param7;
        MakeLabelS2(curDir, inPath, symbol, period, plmin, plmax, plnum);
    }
	else if (mk_method == "mk_label_s3") {
		var inPath = _Params.param2;
        var symbol = _Params.param3;
        var period = _Params.param4;
		MakeLabelS3(curDir, inPath, symbol, period)
	}

})();
