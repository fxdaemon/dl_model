/****************************************************
 * Copyright (c) 2020 FXDaemon All Rights Reserved. *
 ****************************************************/

"use strict";

var MAX_TIME = 2147483647;

/**
 * Get through points with 2 (fast / slow) MA
 * @param fast 
 * @param slow 
 * @param fromPos 
 * return:
 *   {ud, crossPos, crossTime, crossFast, crossSlow, backFast, backSlow}
 */
function GetCrossByMa(fast, slow, fromPos)
{
	var fast_r = fast.real;
	var slow_r = slow.real;
	var ret = GetCrossByHpba(fast_r, slow_r, fromPos);
	if (ret.ud == 0) {
		ret.crossTime = MAX_TIME;
		if (fast_r.length > 0 && slow_r.length > 0) {
			ret.crossPos = fast_r.length - 1 - fromPos;
			ret.crossFast = fast_r[0];
			ret.backFast = fast_r[ret.crossPos];
			ret.crossSlow = slow_r[0];
			ret.backSlow = slow_r[ret.crossPos];
			if (ret.backFast > ret.backSlow) {
				ret.ud = 1;
			} 
			else if (ret.backFast < ret.backSlow) {
				ret.ud = -1;
			}
		}
	}
	else {
		var st = fast.startdate;
		ret.crossTime = st[fast_r.length - 1 - ret.crossPos];
	}

	return ret;
}

/**
 * Get through points by MACD
 * @param macd 
 * @param fromPos 
 * return:
 *   {ud, crossPos, crossTime, crossMacd, crossSignal, backMacd, backSignal}
 */
function GetCrossByMacd(macd, fromPos)
{
  var macd_m = macd.macd;
  var macd_s = macd.signal;  
	var ret = GetCrossByHpba(macd_m, macd_s, fromPos);
	if (ret.ud == 0) {
		ret.crossTime = MAX_TIME;
	} else {
		var macd_st = macd.startdate;
		ret.crossTime = macd_st[macd_m.length-1-ret.crossPos];
	}

	return {
		ud: ret.ud,
		crossPos: ret.crossPos,
		crossTime: ret.crossTime,
		crossMacd: ret.crossFast,
		crossSignal: ret.crossSlow,
		backMacd: ret.backFast,
		backSignal: ret.backSlow
	};
}

/**
 * Get through points by MACD
 * Ignore small slew intervals
 * @param macd 
 * @param fromPos 
 * @param interval 
 * @param diffWidth 
 * return:
 *   {ud, crossPos, crossTime, crossMacd, prevCrossPos, prevCrossMacd, maxCrossPos, maxCrossMacd, revCrossPos, revCrossMacd, backMacd, backSignal}
 */
function GetCrossByMacdEx(macd, fromPos, interval, diffWidth)
{
	var macd_m = macd.macd;
	var macd_s = macd.signal;

	var ret = GetCrossByHpba(macd_m, macd_s, fromPos);
	if (ret.ud == 0) {
		ret.crossTime = MAX_TIME;
		return ret;
	} 

	var macd_st = macd.startdate;
	ret.crossTime = macd_st[macd_m.length-1-ret.crossPos];
	var rev = GetCrossByHpba(macd_m, macd_s, ret.crossPos + 1);
	var prev = GetCrossByHpbaEx(macd_m, macd_s, rev.crossPos + 1, interval, diffWidth);
	var max = GetMaxCrossByHpbaEx(macd_m, macd_s, fromPos, interval, diffWidth);
	var line = GetCrossByLine(macd_m, 0, ret.crossPos);
	if (line.crossPos <= max.crossPos) {
		rev = GetCrossByHpbaEx(macd_m, macd_s, ret.crossPos + 1, interval, diffWidth);
	} else {
		rev = GetMaxCrossByHpbaEx(macd_m, macd_s, max.crossPos + 1, interval, diffWidth);
	}

	return {
		ud: ret.ud,
		crossPos: ret.crossPos,
		crossTime: ret.crossTime,
		crossMacd: ret.crossFast,
		prevCrossPos: prev.crossPos,
		prevCrossMacd: prev.crossFast,
		maxCrossPos: max.crossPos,
		maxCrossMacd: max.crossFast,
		revCrossPos: rev.crossPos,
		revCrossMacd: rev.crossFast,
		backMacd: ret.backFast,
		backSignal: ret.backSlow
	};
}

/**
 * Temporarily set the first through point and get the through point by MACD
 * Ignore small slew intervals
 * @param macd 
 * @param ud 
 * @param fromPos 
 * @param interval 
 * @param diffWidth 
 * return:
 *   {ud, prevCrossPos, prevCrossMacd, maxCrossPos, maxCrossMacd, revCrossPos, revCrossMacd}
 */
function GetAssumeCrossByMacdEx(macd, ud, fromPos, interval, diffWidth)
{
	var macd_m = macd.macd;
	var macd_s = macd.signal;

	var rev = GetCrossByHpba(macd_m, macd_s, fromPos);
	if (rev.ud != ud * -1) {
		return {ud:0};
	}

	var prev = GetCrossByHpbaEx(macd_m, macd_s, rev.crossPos + 1, interval, diffWidth);
	var max = GetMaxCrossByHpbaEx(macd_m, macd_s, rev.crossPos + 1, interval, diffWidth);
	var line = GetCrossByLine(macd_m, 0, fromPos);
	if (line.crossPos <= max.crossPos) {
		rev = GetCrossByHpbaEx(macd_m, macd_s, fromPos, interval, diffWidth);
	} else {
		rev = GetMaxCrossByHpbaEx(macd_m, macd_s, max.crossPos + 1, interval, diffWidth);
	}

	return {
		ud: ud,
		prevCrossPos: prev.crossPos,
		prevCrossMacd: prev.crossFast,
		maxCrossPos: max.crossPos,
		maxCrossMacd: max.crossFast,
		revCrossPos: rev.crossPos,
		revCrossMacd: rev.crossFast
	};
}

/**
 * Acquisition of first through point information by K line and D line
 * @param stoch 
 * @param fromPos 
 * return:
 *   {ud, crossPos, crossTime, crossK, crossD, backK, backD}
 */
function GetCrossByStoch(stoch, fromPos)
{
	var k = stoch.slowk;
	var d = stoch.slowd;
	var ret = GetCrossByHpba(k, d, fromPos);
	if (ret.ud == 0) {
		ret.crossTime = MAX_TIME;
	} else {
		var stoch_st = stoch.startdate;
		ret.crossTime = stoch_st[k.length-1-ret.crossPos];
	}

	return {
		ud: ret.ud,
		crossPos: ret.crossPos,
		crossTime: ret.crossTime,
		crossK: ret.crossFast,
		crossD: ret.crossSlow,
		backK: ret.backFast,
		backD: ret.backSlow
	};
}

/**
 * Acquisition of first through point information by K line and D line
 * Ignore small through spacing or width differences
 * @param stoch 
 * @param fromPos 
 * return:
 *   {ud, crossPos, crossTime, crossK, crossD, backK, backD}
 */
function GetCrossByStochEx(stoch, fromPos, interval, diffWidth)
{
	var k = stoch.slowk;
	var d = stoch.slowd;
	var ret = GetCrossByHpbaEx(k, d, fromPos, interval, diffWidth);
	if (ret.ud == 0) {
		ret.crossTime = MAX_TIME;
	} else {
		var stoch_st = stoch.startdate;
		ret.crossTime = stoch_st[k.length-1-ret.crossPos];
	}

	return {
		ud: ret.ud,
		crossPos: ret.crossPos,
		crossTime: ret.crossTime,
		crossK: ret.crossFast,
		crossD: ret.crossSlow,
		backK: ret.backFast,
		backD: ret.backSlow
	};
}

/**
 * Get through points with STOCH
 * Ignore small through spacing or width differences
 * @param stoch 
 * @param fromPos 
 * @param interval 
 * @param diffWidth 
 * return:
 *   {ud, crossPos, crossTime, crossK, crossD, backK, backD, revCrossPos, revCrossK, revCrossD, prevCrossPos, prevCrossK, prevCrossD}
 */
function GetCrossByStochEx2(stoch, fromPos, interval, diffWidth)
{	
	var k = stoch.slowk;
	var d = stoch.slowd;
	var ret = GetCrossByHpba(k, d, fromPos);
	if (ret.ud == 0) {
		ret.crossTime = MAX_TIME;
		return ret;
	} 

	var stoch_st = stoch.startdate;
	ret.crossTime = stoch_st[k.length-1-ret.crossPos];
	var rev = GetRevCrossByHpbaEx(k, d, ret.crossPos + 1, interval, diffWidth);
	var prev = GetRevCrossByHpbaEx(k, d, prev.crossPos + 1, interval, diffWidth);
	
	return {
		ud: ret.ud,
		crossPos: ret.crossPos,
		crossTime: ret.crossTime,
		crossK: ret.crossFast,
		crossD: ret.crossSlow,
		backK: ret.backFast,
		backD: ret.backSlow,
		revCrossPos: rev.crossPos,
		revCrossK: rev.crossFast,
		revCrossD: rev.crossSlow,
		prevCrossPos: prev.crossPos,
		prevCrossK: prev.crossFast,
		prevCrossD: prev.crossSlow
	};
}

/*
 - Get MAX through point information retroactively by K line and D line
 -Ignore small through spacing or width differences
 - parameter:
 -   [in]  stoch (STOCH)
 -   [in]  fromPos (int >=0)
 -   [in]  interval (int)
 -   [in]  diffWidth (int)
 -   [in]  inRatio (int)
 -   [out] outCrossPos (int >=0)
 -   [out] outCrossTime (double)
 -   [out] outCrossK (double)
 -   [out] outCrossD (double)
 -   [out] outBackK (double)
 -   [out] outBackD (double)
 -   [out] outKMaxPos (int)
 -   [out] outMaxK (double) 
 - return:
 -   1:  up
 -   -1: down
 */
function GetMaxCrossByStochEx(stoch, fromPos, interval, diffWidth, ratio, outCrossPos, outCrossTime, outCrossK, outCrossD, outBackK, outBackD, outKMaxPos, outMaxK)
{
	var k = stoch.slowk;
	var d = stoch.slowd;
	var ret = GetMaxCrossByHpbaEx(k, d, fromPos, interval, diffWidth);
	if (ret.ud == 0) {
		ret.crossTime = MAX_TIME;
	} else {
		var stoch_st = stoch.startdate;
		ret.crossTime = stoch_st[k.length-1-ret.crossPos];
	}
	
	var maxInfo = GetMaxInfoByHpbaEx(k, d, fromPos, ratio, interval, diffWidth);

	return {
		ud: ret.ud,
		crossPos: ret.crossPos,
		crossTime: ret.crossTime,
		crossK: ret.crossFast,
		crossD: ret.crossSlow,
		backK: ret.backFast,
		backD: ret.backSlow,
		kMaxPos: maxInfo.pos,
		maxK: maxInfo.val
	};
}
