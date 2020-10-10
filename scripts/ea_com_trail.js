/****************************************************
 * Copyright (c) 2020 FXDaemon All Rights Reserved. *
 ****************************************************/

"use strict";

/**
 * Close trade
 * @param tradeObj
 */
function CloseTrade(tradeObj)
{
	_CloseTradeById(tradeObj.id, tradeObj.amount);
}

/**
 * Close trade
 * @param tradeObj 
 * @param ud 
 * @param crossTime 
 * return:
 *   1:Already  0:Not yet
 */
function TrailStopByCross(tradeObj, ud, crossTime)
{
	var ret = 0;

	if (tradeObj.opentime < crossTime) {
		if (tradeObj.isbuy) {
			if (ud == -1) {
				CloseTrade(tradeObj);
				ret = 1;
			}
		} else {
			if (ud == 1) {
				CloseTrade(tradeObj);
				ret = 1;
			}
		}
	}

	if (ret) {
		_Log.info("[TrailStopByCross] tradeObj:" + tradeObj.id + " ud:" + ud + " crossTime:" + crossTime + " ret:" + ret);
	}
	return ret;
}

/**
 * trailmove
 * @param tradeObj 
 * @param trlMoveLimit 
 * @param trlMoveAt 
 * example:
 *        trlMoveLimit:50 trlMoveAt:10
 *        diffPrice=50 --> stop=open+10
 */
function TrailMoveAt(tradeObj, trlMoveLimit, trlMoveAt)
{
	var symbol = tradeObj.symbol;
	var pointSize = _GetPointSize(symbol);
	var trlMoveLimit = trlMoveLimit * pointSize;
	var trlMoveStop = trlMoveAt * pointSize;

	var open = tradeObj.open;
	var stop = tradeObj.stop;
	var close = tradeObj.close;

	var diffPrice, diffStop;
	if (tradeObj.isbuy) {
		diffPrice = close - open;
		diffStop = stop - open;
	} else {
		diffPrice = open - close;
		diffStop = open - stop;
	}

	if (diffStop < 0) {
		if (diffPrice >= trlMoveLimit) {
			if (tradeObj.isbuy) {
				stop = open + trlMoveStop;
			} else {
				stop = open - trlMoveStop;
			}
			_ChangeStopLoss(tradeObj.id, stop);
			_Log.info("[TrailMoveAt] symbol:" + symbol + " trlMoveLimit:" + trlMoveLimit + " trlMoveAt:" + trlMoveAt + " stop:" + stop);
		}
	}
}

/**
 * trailmove
 * @param tradeObj 
 * @param trlMoveFirst 
 * @param firstStop 
 * @param trlMoveUnt 
 * @param trlMoveRatio 
 * example:
 *        trlMoveFirst:50 firstStop:10 trlMoveUnt:50 trlMoveRatio:0.382
 *        diffPrice=50 --> stop=open+10
 *        diffPrice=130 --> stop=open+50
 *        diffPrice=260 --> stop=open+100
 */
function TrailMoveRatio(tradeObj, trlMoveFirst, firstStop, trlMoveUnt, trlMoveRatio)
{
	var symbol = tradeObj.symbol;
	var pointSize = _GetPointSize(symbol);
	var open = tradeObj.open;
	var stop = tradeObj.stop;
	var close = tradeObj.close;

	var diffPrice, diffStop;
	if (tradeObj.isbuy) {
		diffPrice = close - open;
		diffStop = stop - open;
	} else {
		diffPrice = open - close;
		diffStop = open - stop;
	}

	if (diffStop < 0) {
		trlMoveFirst = trlMoveFirst * pointSize;
		firstStop = firstStop * pointSize;
		if (diffPrice >= trlMoveFirst) {
			if (tradeObj.isbuy) {
				stop = open + firstStop;
			} else {
				stop = open - firstStop;
			}
			_ChangeStopLoss(tradeObj.id, stop);
			_Log.info("[TrailMoveRatio1] symbol:" + symbol + " trlMoveFirst:" + trlMoveFirst + " firstStop:" + firstStop + " stop:" + stop);
		}
	} else if (diffStop >= 0){
		trlMoveUnt = trlMoveUnt * pointSize;
		diffPrice = diffPrice * trlMoveRatio;
		if (diffStop + pointSize < trlMoveUnt) {
			diffStop = 0;
		}
		if (diffPrice - diffStop >= trlMoveUnt) {
			if (tradeObj.isbuy) {
				//stop = open + diffPrice;
				stop = open + diffStop + trlMoveUnt;
			} else {
				//stop = open - diffPrice;
				stop = open - (diffStop + trlMoveUnt);
			}
			_ChangeStopLoss(tradeObj.id, stop);
			_Log.info("[TrailMoveRatio2] symbol:" + symbol + " trlMoveUnt:" + trlMoveUnt + " trlMoveRatio:" + trlMoveRatio + " stop:" + stop);
		}
	}
}

/**
 * trailmove
 * @param tradeObj 
 * @param trlMoveFirst 
 * @param firstStop 
 * @param trlMoveUnt 
 * example:
 *        trlMoveFirst:50 firstStop:10 trlMoveUnt:50
 *        diffPrice=50 --> stop=open+10
 *        diffPrice=100 --> stop=open+50
 *        diffPrice=150 --> stop=open+100
 *        diffPrice=200 --> stop=open+150
 */
function TrailMoveGrade(tradeObj, trlMoveFirst, firstStop, trlMoveUnt)
{
	var symbol = tradeObj.symbol;
	var pointSize = _GetPointSize(symbol);
	var open = tradeObj.open;
	var stop = tradeObj.stop;
	var close = tradeObj.close;

	var diffPrice, diffStop;
	if (tradeObj.isbuy) {
		diffPrice = close - open;
		diffStop = stop - open;
	} else {
		diffPrice = open - close;
		diffStop = open - stop;
	}

	if (diffStop < 0) {
		trlMoveFirst = trlMoveFirst * pointSize;
		firstStop = firstStop * pointSize;
		if (diffPrice >= trlMoveFirst) {
			if (tradeObj.isbuy) {
				stop = open + firstStop;
			} else {
				stop = open - firstStop;
			}
			_ChangeStopLoss(tradeObj.id, stop);
			_Log.info("[TrailMoveGrade1] symbol:" + symbol + " trlMoveFirst:" + trlMoveFirst + " firstStop:" + firstStop + " stop:" + stop);
		}
	} else if (diffStop >= 0){
		trlMoveUnt = trlMoveUnt * pointSize;
		if (diffStop + pointSize < trlMoveUnt) {
			diffStop = 0;
		}
		if (diffPrice - diffStop >= 2 * trlMoveUnt) {
			if (tradeObj.isbuy) {
				stop = stop + trlMoveUnt;
			} else {
				stop = stop - trlMoveUnt;
			}
			_ChangeStopLoss(tradeObj.id, stop);
			_Log.info("[TrailMoveGrade2] symbol:" + symbol + " trlMoveUnt:" + trlMoveUnt + " stop:" + stop);
		}
	}
}

/**
 * trailmove
 * @param tradeObj 
 * @param trlMoveFirst 
 * @param firstStop 
 * @param trlMoveUnt 
 * example:
 *        trlMoveFirst:50 firstStop:10 trlMoveUnt:50
 *        diffPrice=50 --> stop=open+10
 *        diffPrice=64 --> stop=open+14
 *        diffPrice=72 --> stop=open+22
 */
 function TrailMoveUnit(tradeObj, trlMoveFirst, firstStop, trlMoveUnt)
{
	var symbol = tradeObj.symbol;
	var pointSize = _GetPointSize(symbol);
	var open = tradeObj.open;
	var stop = tradeObj.stop;
	var close = tradeObj.close;

	var diffPrice, diffStop;
	if (tradeObj.isbuy) {
		diffPrice = close - open;
		diffStop = stop - open;
	} else {
		diffPrice = open - close;
		diffStop = open - stop;
	}

	if (diffStop < 0) {
		trlMoveFirst = trlMoveFirst * pointSize;
		firstStop = firstStop * pointSize;
		if (diffPrice >= trlMoveFirst) {
			if (tradeObj.isbuy) {
				stop = open + firstStop;
			} else {
				stop = open - firstStop;
			}
			_ChangeStopLoss(tradeObj.id, stop);
			_Log.info("[TrailMoveUnit1] symbol:" + symbol + " trlMoveFirst:" + trlMoveFirst + " firstStop:" + firstStop + " stop:" + stop);
		}
	} else if (diffStop >= 0){
		trlMoveUnt = trlMoveUnt * pointSize;
		var diffCloseStop = diffPrice - diffStop;
		if (diffCloseStop > trlMoveUnt) {
			if (tradeObj.isbuy) {
				stop = stop + (diffCloseStop - trlMoveUnt);
			} else {
				stop = stop - (diffCloseStop - trlMoveUnt);
			}
			_ChangeStopLoss(tradeObj.id, stop);
			_Log.info("[TrailMoveUnit2] symbol:" + symbol + " trlMoveUnt:" + trlMoveUnt + " stop:" + stop);
		}
	}
}

/**
 * trailmove
 * @param tradeObj 
 * @param trlMoveFirst 
 * @param firstStop 
 * @param trlMovePUnt 
 * @param trlMoveSUnt 
 * @param maxStop 
 * example:
 *        trlMoveFirst:40 firstStop:1 trlMovePUnt:20 trlMoveSUnt:10 maxStop:60
 *        diffPrice=40 --> stop=open+1
 *        diffPrice=60 --> stop=open+10
 *        diffPrice=80 --> stop=open+20
 *        diffPrice=100 --> stop=open+30
 *        diffPrice=120 --> stop=open+40
 */
 function TrailMoveEqdiff(tradeObj, trlMoveFirst, firstStop, trlMovePUnt, trlMoveSUnt, maxStop)
{
	var symbol = tradeObj.symbol;
	var pointSize = _GetPointSize(symbol);
	var open = tradeObj.open;
	var stop = tradeObj.stop;
	var close = tradeObj.close;

	var diffPrice, diffStop;
	if (tradeObj.isbuy) {
		diffPrice = (close - open) / pointSize;
		diffStop = (stop - open) / pointSize;
	} else {
		diffPrice = (open - close) / pointSize;
		diffStop = (open - stop) / pointSize;
	}

	if (diffStop < 0) {
		if (diffPrice >= trlMoveFirst) {
			if (tradeObj.isbuy) {
				stop = open + firstStop * pointSize;
			} else {
				stop = open - firstStop * pointSize;
			}
			_ChangeStopLoss(tradeObj.id, stop);
			_Log.info("[TrailMoveEqdiff1] symbol:" + symbol + " trlMoveFirst:" + trlMoveFirst + " firstStop:" + firstStop + " stop:" + stop);
		}
	} else if (diffStop >= 0){
		var delta = 0;
		if (diffStop + 1 < trlMoveSUnt) {
			diffStop = 0;
			delta = firstStop;
		}
		if (diffPrice >= trlMoveFirst + trlMovePUnt * (diffStop + trlMoveSUnt) / trlMoveSUnt) {
			if (tradeObj.isbuy) {
				stop = stop + (trlMoveSUnt - delta) * pointSize;
			} else {
				stop = stop + (delta - trlMoveSUnt) * pointSize;
			}
			var isChange = true;
			if (maxStop > 0) {
				if (tradeObj.isbuy) {
					if (stop > open + maxStop * pointSize) {
						isChange = false;
					}
				} else {
					if (stop < open - maxStop * pointSize) {
						isChange = false;
					}
				}
			}
			if (isChange) {
				_ChangeStopLoss(tradeObj.id, stop);
				_Log.info("[TrailMoveEqdiff2] symbol:" + symbol + " trlMovePUnt:" + trlMovePUnt + " trlMoveSUnt:" + trlMoveSUnt + " stop:" + stop);
			}
		}
	}
}
