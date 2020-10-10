/****************************************************
 * Copyright (c) 2020 FXDaemon All Rights Reserved. *
 ****************************************************/

"use strict";

var trailmove_funcs = [];

trailmove_funcs.trailmove_at = function(tradeObj, params)
{
	TrailMoveAt(tradeObj, params[0], params[1]);
}

trailmove_funcs.trailmove_eqdiff = function(tradeObj, params)
{
	TrailMoveEqdiff(tradeObj, params[0], params[1], params[2], params[3], params[4]);
}

trailmove_funcs.trailmove_grade = function(tradeObj, params)
{
	TrailMoveGrade(tradeObj, params[0], params[1], params[2]);
}

trailmove_funcs.trailmove_ratio = function(tradeObj, params)
{
	TrailMoveRatio(tradeObj, params[0], params[1], params[2], params[3]);
}

trailmove_funcs.trailmove_unit = function(tradeObj, params)
{
	TrailMoveUnit(tradeObj, params[0], params[1], params[2]);
}

function _trailmove(tradeid, trailmove)
{
	var tradeObj = _GetTrade(tradeid);
	if (tradeObj === undefined) {
		_Log.error(tradeid + " is not exist.");
	}
	else {
		var q = trailmove.indexOf("?");
		if (q >= 0) {
			var trailmove_name = trailmove.substring(0, q);
			var params = trailmove.substring(q + 1).split(':');
			for (var i = 0; i < params.length; i++) {
				params[i] = parseInt(params[i]);
			}
			trailmove_funcs[trailmove_name](tradeObj, params);
		}
	}
}

