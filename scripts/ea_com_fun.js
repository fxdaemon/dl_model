/****************************************************
 * Copyright (c) 2020 FXDaemon All Rights Reserved. *
 ****************************************************/

"use strict";

function Str2Date(t)
{
	return _CDate(t.substr(0,4) + '/' + t.substr(4,2) + "/" + t.substr(6,2) + " " 
		+ t.substr(8,2) + ":" + t.substr(10,2) + ":" + t.substr(12,2));
}

function ArrayDivide(ary, divisor) 
{
	for (var i = 0; i < ary.length; i++) {
		ary[i] /= divisor;
	}
	return ary;
}

/*
 - Determine if it has the same sign
 - parameter:
 -   [in] n1 (double)
 -   [in] n2 (double)
 - return:
 -   true:same  false:adverse
 */
function IsSameSign(n1, n2)
{
	if (n1 > 0 && n2 > 0 || n1 < 0 && n2 < 0) {
		return true;
	}
	else {
		return false;
	}
}

/**
 * Determine if in reverse zone
 * @param ud 
 * @param k
 * @param low
 * @param high
 * return:
 *   true:inside  false:outside
 */
function IsRevZone(ud, k, low, high)
{
	if (ud == 1 && k < low || ud == -1 && k > high) {
		return true;
	}
	else {
		return false;
	}
}

/**
 * Determine if in forward zone
 * @param ud 
 * @param k
 * @param low
 * @param high
 * return:
 *   true:inside  false:outside
 */
function IsFwdZone(ud, k, low, high)
{
	if (ud == 1 && k > high || ud == -1 && k < low) {
		return true;
  }
  else {
		return false;
	}
}

/**
 * Determine if only the forward line has been crossed
 * @param ud
 * @param prev_k
 * @param k
 * @param low
 * @param high
 * return:
 *   true:cross  false:below
 */
function IsFwdCrossLine(ud, prev_k, k, low, high)
{
	if (ud == 1 && prev_k <= high && k > high ||
		ud == -1 && prev_k >= low && k < low) {
		return true;
  }
  else {
		return false;
	}
}

/**
 * Determine if the forward rotation line has been exceeded
 * @param ud
 * @param k
 * @param line 
 * return:
 *   true:below  false:above
 */
function IsFwdBelowLine(ud, k, line)
{
	if (ud == 1 && k < line || ud == -1 && k > line) {
		return true;
  }
  else {
		return false;
	}
}

/**
 * Determine if the axis is crossed
 * @param val1
 * @param val2
 * @param line
 * return:
 *   true:Straddle  false:Not straddle
 */
function IsAcrossLine(val1, val2, line)
{
	if (val1 == val2) {
		return false;
	}
	if (val1 <= line && val2 >= line ||
		val1 >= line && val2 <= line) {
		return true;
  }
  else {
		return false;
	}
}

/**
 * Determine MACD separation
 * @param ud 
 * @param crossPos 
 * @param crossMacd 
 * @param crossPriceUpon 
 * @param maxCrossPos 
 * @param maxCrossMacd 
 * @param maxCrossPriceUpon 
 * @param revCrossPos 
 * return:
 *   true:yes  false:no
 */
function IsMacdFallAway(ud, crossPos, crossMacd, crossPriceUpon, maxCrossPos, maxCrossMacd, maxCrossPriceUpon, revCrossPos)
{
	if (crossPos < maxCrossPos && maxCrossPos < revCrossPos) {
		if (ud == 1 && crossMacd <= 0 && crossMacd > maxCrossMacd && crossPriceUpon < maxCrossPriceUpon ||
			ud == -1 && crossMacd >= 0 && crossMacd < maxCrossMacd && crossPriceUpon > maxCrossPriceUpon) {
			return true;
    }
    else {
			return false;
		}
  }
  else {
		return false;
	}
}

/**
 * Determine MACD separation
 * @param ud 
 * @param crossPos 
 * @param crossMacd 
 * @param maxCrossPos 
 * @param maxCrossMacd 
 * @param revCrossPos 
 * return:
 *   true:yes  false:no
 */
function IsMacdFallAwayEx(ud, crossPos, crossMacd, maxCrossPos, maxCrossMacd, revCrossPos)
{
	if (crossPos < maxCrossPos && maxCrossPos < revCrossPos) {
		if (ud == 1 && crossMacd <= 0 && crossMacd > maxCrossMacd ||
			ud == -1 && crossMacd >= 0 && crossMacd < maxCrossMacd) {
			return true;
    }
    else {
			return false;
		}
  }
  else {
		return false;
	}
}

/**
 * Determine MACD match
 * @param ud
 * @param crossPos 
 * @param crossMacd 
 * @param crossPrice 
 * @param prevCrossPos 
 * @param prevCrossMacd 
 * @param prevCrossPrice 
 * @param maxCrossPos 
 * @param drift 
 * return:
 *   true:yes  false:no
 */
function IsMacdFallOn(ud, crossPos, crossMacd, crossPrice, prevCrossPos, prevCrossMacd, prevCrossPrice, revCrossPos, maxCrossPos, drift)
{
	if (crossPos < prevCrossPos && prevCrossPos <= maxCrossPos && revCrossPos < maxCrossPos) {
    if (ud == 1 && crossMacd > prevCrossMacd && crossPrice > (prevCrossPrice - drift) ||
      ud == -1 && crossMacd < prevCrossMacd && crossPrice < (prevCrossPrice + drift)) {
			return true;
    }
    else {
			return false;
		}
  }
  else {
		return false;
	}
}

/**
 * Determine MACD match
 * @param ud
 * @param crossPos 
 * @param crossMacd 
 * @param prevCrossPos 
 * @param prevCrossMacd 
 * @param maxCrossPos 
 * return:
 *   true:yes  false:no
 */
function IsMacdFallOnEx(ud, crossPos, crossMacd, prevCrossPos, prevCrossMacd, revCrossPos, maxCrossPos)
{
	if (crossPos < prevCrossPos && prevCrossPos <= maxCrossPos && revCrossPos < maxCrossPos) {
    if (ud == 1 && crossMacd > prevCrossMacd || ud == -1 && crossMacd < prevCrossMacd) {
			return true;
    }
    else {
			return false;
		}
  }
  else {
		return false;
	}
}

/**
 * Get the minimum or maximum value of the period
 * @param real 
 * @param fromPos 
 * @param toPos 
 * @param kbn
 * return:
 *   {pos:minMaxPos, val:minMaxVal}
 */
function GetMinMaxOfPeriod(real, fromPos, toPos, kbn)
{
	if (fromPos > toPos) {
		return 0;
	}

	var count = real.length;
	if (count == 0) {
		return 0;
	}

	var pos1 = count - 1 - fromPos;
	var pos2 = count - 1 - toPos;
	if (pos1 < 0 || pos1 >= count || pos2 < 0 || pos2 >= count) {
		return 0;
	}

	var minMaxVal = real[pos1];
	var minMaxPos = fromPos;

	if (kbn == -1) {
		for (var i = pos1 - 1; i >= pos2; i--) {
			if (real[i] < minMaxVal) {
				minMaxVal = real[i];
				minMaxPos = count - 1 - i;
			}
		}
  }
  else if (kbn == 1) {
		for (var i = pos1 - 1; i >= pos2; i--) {
			if (real[i] > minMaxVal) {
				minMaxVal = real[i];
				minMaxPos = count - 1 - i;
			}
		}
	}

	return {pos: minMaxPos, val: minMaxVal};
}

/**
 * Get the minimum value of the period
 * @param real
 * @param fromPos
 * @param toPos
 * return:
 *   {pos:minMaxPos, val:minMaxVal}
 */
function GetMinOfPeriod(real, fromPos, toPos)
{
	return GetMinMaxOfPeriod(real, fromPos, toPos, -1);
}

/**
 * Get the maximum value of the period
 * @param real
 * @param fromPos
 * @param toPos
 * return:
 *   {pos:minMaxPos, val:minMaxVal}
 */
function GetMaxOfPeriod(real, fromPos, toPos)
{
	return GetMinMaxOfPeriod(real, fromPos, toPos, 1);
}

/**
 * Get through point information where the curve crosses the line
 * @param real 
 * @param line
 * @param fromPos 
 * return:
 *   {ud, crossPos, crossVal, backVal}
 */
function GetCrossByLine(real, line, fromPos)
{
	var ud = 0;
	var count = real.length;
	var endPos = count - 1 - fromPos;

	for (var i = endPos; i > 0; i--) {
		if (real[i-1] <= line && real[i] > line) {
			ud = 1;
			break;
    }
    else if (real[i-1] >= line && real[i] < line) {
			ud = -1;
			break;
		}
	}

	var ret = {ud: ud};
	if (ud != 0) {
		ret.crossPos = count - 1 - i;
		ret.crossVal = real[i-1];
		ret.backVal = real[endPos];
	}

	return ret;
}

/**
 * Through point information is acquired by two (fast and slow) curves
 * @param fast 
 * @param slow 
 * @param fromPos 
 * return:
 *   {ud, crossPos, crossFast, crossSlow, backFast, backSlow}
 */
function GetCrossByHpba(fast, slow, fromPos)
{
	var ud = 0;
	var count = fast.length;
	var endPos = count - 1 - fromPos;

	for (var i = endPos; i > 0; i--) {
		if (fast[i-1] <= slow[i-1] && fast[i] > slow[i]) {
			ud = 1;
			break;
    }
    else if (fast[i-1] >= slow[i-1] && fast[i] < slow[i]) {
			ud = -1;
			break;
		}
	}

	var ret = {ud: ud};
	if (ud != 0) {
		ret.crossPos = count - 1 - i;
		ret.crossFast = fast[i-1];
		ret.crossSlow = slow[i-1];
		ret.backFast = fast[endPos];
		ret.backSlow = slow[endPos];
	}

	return ret;
}

/**
 * Through point information is acquired by two (fast and slow) curves
 * Ignore small through spacing or width differences
 * @param fast 
 * @param slow 
 * @param fromPos 
 * @param interval 
 * @param diffWidth 
 * return:
 *   {ud, crossPos, crossFast, crossSlow, backFast, backSlow}
 */
function GetCrossByHpbaEx(fast, slow, fromPos, interval, diffWidth)
{
	var ret = GetCrossByHpba(fast, slow, fromPos);
	if (ret.ud == 0) {
		return ret;
	}

	do {
		var rev = GetCrossByHpba(fast, slow, ret.crossPos + 1);
		if (rev.ud != (ret.ud * -1)) {
			break;
		}
		if (rev.crossPos - ret.crossPos > interval && GetMaxDiffWidthOfCross(fast, slow, ret.crossPos, rev.crossPos) > diffWidth) {
			break;
		}
		var next = GetCrossByHpba(fast, slow, rev.crossPos + 1);
		if (next.ud != ret.ud) {
			break;
		}
		ret.crossPos = next.crossPos;
		ret.crossFast = next.crossSlow;
		ret.crossSlow = next.crossSlow;
	}
	while (true);

	return ret;
}

/**
 * Inverted through point information is acquired from the current through point by two (fast / slow) curves
 * Ignore small through spacing or width differences
 * @param fast 
 * @param slow 
 * @param crossPos 
 * @param interval 
 * @param diffWidth 
 * return:
 *   {ud, crossPos, crossFast, crossSlow, backFast, backSlow}
 */
function GetRevCrossByHpbaEx(fast, slow, crossPos, interval, diffWidth)
{
	var prev = GetCrossByHpbaEx(fast, slow, crossPos, interval, diffWidth);
	if (prev.ud == 0) {
		return prev;
	}
	if (crossPos == prev.crossPos) {
		return GetCrossByHpba(fast, slow, crossPos + 1);
	}
	else {
		var rev = GetCrossByHpbaEx(fast, slow, crossPos + 1, interval, diffWidth);
		if (prev.crossPos < rev.CrossPos && rev.ud != 0) {
			rev = GetCrossByHpba(fast, slow, prev.crossPos + 1);
		}
		return rev;
	}
}

/**
 * Get MAX through point information retroactively with two (fast / slow) curves
 * @param fast 
 * @param slow 
 * @param fromPos 
 * return:
 *   {ud, crossPos, crossFast, crossSlow, backFast, backSlow}
 */
function GetMaxCrossByHpba(fast, slow, fromPos)
{
	var ret = GetCrossByHpba(fast, slow, fromPos);
	if (ret.ud == 0) {
		return ret;
	}

	do {
		var rev = GetCrossByHpba(fast, slow, ret.crossPos + 1);
		if (rev.ud != (ret.ud * -1)) {
			break;
		}
		var next = GetCrossByHpba(fast, slow, rev.crossPos + 1);
		if (next.ud != ret.ud) {
			break;
		}
		if (ret.ud == 1 && next.crossFast > ret.crossFast ||
			ret.ud == -1 && next.crossFast < ret.crossFast) {
			break;
		}
		ret.crossPos = next.crossPos;
		ret.crossFast = next.crossSlow;
		ret.crossSlow = next.crossSlow;
	}
	while (true);

	return ret;
}

/**
 * Get MAX through point information retroactively with two (fast / slow) curves
 * Ignore small through spacing or width differences
 * @param fast 
 * @param slow 
 * @param fromPos 
 * @param interval 
 * @param diffWidth 
 * return:
 *   {ud, crossPos, crossFast, crossSlow, backFast, backSlow}
 */
function GetMaxCrossByHpbaEx(fast, slow, fromPos, interval, diffWidth)
{
	var ret = GetCrossByHpbaEx(fast, slow, fromPos, interval, diffWidth);
	if (ret.ud == 0) {
		return ret;
	}

	do {
		var rev = GetCrossByHpba(fast, slow, ret.crossPos + 1);
		if (rev.ud != (ret.ud * -1)) {
			break;
		}
		var next = GetCrossByHpbaEx(fast, slow, rev.crossPos + 1, interval, diffWidth);
		if (next.ud != ret.ud) {
			break;
		}
		if (ret.ud == 1 && next.crossFast > ret.crossFast ||
			ret.ud == -1 && next.crossFast < ret.crossFast) {
			break;
		}
		ret.crossPos = next.crossPos;
		ret.crossFast = next.crossSlow;
		ret.crossSlow = next.crossSlow;
	}
	while (true);

	return ret;
}

/**
 * Get MAX through point information retroactively with two (fast / slow) curves
 * All parts above the line are targeted
 * @param fast 
 * @param slow 
 * @param fromPos 
 * @param line 
 * return:
 *   {ud, crossPos, crossFast, crossSlow, backFast, backSlow}
 */
function GetMaxCrossByHpbaOverLine(fast, slow, fromPos, line)
{
	var ret = GetCrossByHpba(fast, slow, fromPos);
	if (ret.ud == 1 && ret.crossFast > line || ret.ud == -1 && ret.crossFast < line) {
		return ret;
	}

	var crossPos = ret.crossPos;
	do {
		var rev = GetCrossByHpba(fast, slow, crossPos + 1);
		if (rev.ud != (ret.ud * -1)) {
			break;
		}
		if (ret.ud == 1 && rev.crossFast > line || ret.ud == -1 && rev.crossFast < line) {
			break;
		}
		var next = GetCrossByHpba(fast, slow, rev.crossPos + 1);
		if (next.ud != ret.ud) {
			break;
		}
		if (ret.ud == 1 && next.crossFast > line || ret.ud == -1 && next.crossFast < line) {
			break;
		}
		if (ret.ud == 1 && next.crossFast < ret.crossFast || ret.ud == -1 && next.crossFast > ret.crossFast) {
			ret.crossPos = next.crossPos;
			ret.crossFast = next.crossSlow;
			ret.crossSlow = next.crossSlow;
		}
		crossPos = next.crossPos;
	}
	while (true);

	return ret;
}

/**
 * Get Max information of specified direction from fast curve by 2 (fast / slow) curve
 * up:minimum  down:maximum
 * @param fast 
 * @param slow 
 * @param fromPos 
 * @param ud 
 * @param interval 
 * @param diffWidth 
 * return:
 *   {ud, pos, val, backFast, backSlow}
 */
function GetMaxInfoByHpbaEx(fast, slow, fromPos, ud, interval, diffWidth)
{
	var from = GetCrossByHpba(fast, slow, fromPos);
	var to = from;
	if (from.ud == ud) {
		to = GetCrossByHpbaEx(fast, slow, from.crossPos + 1, interval, diffWidth);
	}
	var minMaxInfo = GetMinMaxOfPeriod(fast, fromPos, to.crossPos, from.ud * -1);
	minMaxInfo.ud = from.ud * -1;
	minMaxInfo.backFast = from.backFast;
	minMaxInfo.backSlow = from.backSlow;
	return minMaxInfo;
}

/**
 * Calculate the angle of two straight lines
 * degree / radian:  360 ÷ (2 × PI) = 57.29578   ==>DEG
 * radian / degree:    (2 × PI) ÷ 360 = 0.017453
 * @param x1 
 * @param y1 
 * @param x2 
 * @param y2 
 * @param x3 
 * @param y3 
 * @param x4 
 * @param y4 
 * return:
 *   degree
 */
function GetLinesDegree(x1, y1, x2, y2, x3, y3, x4, y4)
{
	if (x1 == x2) {
		k1 = 0;
	} else {
		k1 = (y2 - y1) / (x2 - x1);
	}
	if (x3 == x4) {
		k2 = 0;
	} else {
		k2 = (y4 - y3) / (x4 - x3);
	}
	return Math.atan((k2 - k1) / (1 + k1 * k2)) * 57.2957795130823208768;
}

/**
 * Get array element
 * @param real 
 * @param pos 
 * return:
 *   value of element
 */
function GetRealVal(real, pos)
{
	var realArray = real.real;
	var size = realArray.length;
	if (pos >= 0 && pos < size) {
		return realArray[size - 1 - pos];
	} else {
		return 0;
	}
}

/**
 * Maximum value of the difference in width between two (fast and slow) curves between two adjacent through points
 * @param fast 
 * @param slow 
 * @param fromPos 
 * @param toPos 
 * return:
 *   Maximum value of width difference
 */
function GetMaxDiffWidthOfCross(fast, slow, fromPos, toPos)
{
	var count = fast.length;
	var maxDiffWidth = 0;
	var fromPos = count - 1 - fromPos;
	var toPos = count - 1 - toPos;
	for (var i = fromPos; i >= toPos; i--) {
		var diff = Math.abs(fast[i] - slow[i]); 
		if (diff > maxDiffWidth) {
			maxDiffWidth = diff;
		}
	}
	return maxDiffWidth;
}
