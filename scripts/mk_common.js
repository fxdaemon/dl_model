/****************************************************
 * Copyright (c) 2020 FXDaemon All Rights Reserved. *
 ****************************************************/

"use strict";

var NON = '0';
var BUY = '1';
var SELL = '2';

function DefPLOnLimit(pbList, ud, _limit)
{
	var open = 0, close = 0;
	var high = 0, low = 0;
	var highpos = 0, lowpos = 0;
	for (var i = 0; i < pbList.length; i++) {
		if (ud == BUY) {
			if (i == 0) {
				open = pbList[i].askOpen;
				high = pbList[i].bidHigh;
				highpos = i;
				low = pbList[i].bidLow;
				lowpos = i;
			}
			else if (i == pbList.length - 1) {
				close = pbList[i].bidClose;
			}
			if (pbList[i].bidHigh > high) {
				high = pbList[i].bidHigh;
				highpos = i;
			}
			if (pbList[i].bidLow < low) {
				low = pbList[i].bidLow;
				lowpos = i;
			}

			if (high - open >= _limit) {
				break;
			}
		}
		else if (ud == SELL) {
			if (i == 0) {
				open = pbList[i].bidOpen;
				high = pbList[i].askHigh;
				highpos = i;
				low = pbList[i].askLow;
				lowpos = i;
			}
			else if (i == pbList.length - 1) {
				close = pbList[i].askClose;
			}
			if (pbList[i].askHigh > high) {
				high = pbList[i].askHigh;
				highpos = i;
			}
			if (pbList[i].askLow < low) {
				low = pbList[i].askLow;
				lowpos = i;
			}

			if (open - low >= _limit) {
				break;
			}
		}
	}

	if (ud == BUY) {
		return {
			max_profit: high - open,
			max_loss: open - low,
			pos_diff: lowpos - highpos
		}
	}
	else if (ud == SELL) {
		return {
			max_profit: open - low,
			max_loss: high - open,
			pos_diff: highpos - lowpos
		}
	}
}

function DefMacdCross(stoch_cross, macd_cross, over_line)
{
	if (macd_cross.crossPos == 0 && 
			macd_cross.ud == stoch_cross.ud && 
			IsRevZone(stoch_cross.ud, stoch_cross.crossK, over_line, 100 - over_line)) {
		return macd_cross.ud;
	}
	else {
		return NON;
	}
}

//============================================================================================

function LabelClassifyS1(stoch_over_line)
{
	this.stoch_over_line = stoch_over_line;
}

LabelClassifyS1.prototype.init = function()
{
	this.labels = [];
	this.non_cnt = 0;
	this.buy_cnt = 0;
	this.sell_cnt = 0;
}

LabelClassifyS1.prototype.classify = function(stoch_cross, macd_cross, assume = false)
{
	var ud = DefMacdCross(stoch_cross, macd_cross, this.stoch_over_line);
	var retr_pos = stoch_cross.crossPos;

	var label = NON;
	if (ud == 1) {			//buy
		label = BUY;
	}
	else if (ud == -1) {	//sell
		label = SELL;
	}
	this.labels.push(label);

	if (label != NON && assume) {
		for (var i = this.labels.length - retr_pos - 1; i < this.labels.length - 1; i++) {
			this.labels[i] = label;
		}
	}
}

LabelClassifyS1.prototype.close = function()
{
	this.labels.forEach(label => {
		if (label == NON) {
			this.non_cnt++;
		}
		else if (label == BUY) {
			this.buy_cnt++;
		}
		else if (label == SELL) {
			this.sell_cnt++;
		}
	});
}

//============================================================================================

function LabelClassifyS2(pl_min, pl_max, pl_num, point_size)
{
	this.pl_min = pl_min * point_size;
	this.pl_max = pl_max * point_size;
	this.pl_num = pl_num;
	this.point_size = point_size;
	this.pl_step = 32;
}

LabelClassifyS2.prototype.init = function()
{
	this.labels = [];
	this.non_cnt = 0;
	this.buy_cnt = 0;
	this.sell_cnt = 0;
}

LabelClassifyS2.prototype.getLabel = function(index)
{
	return this.labels[index].substr(0, 1);
}

LabelClassifyS2.prototype.count = function()
{
	this.non_cnt = 0;
	this.buy_cnt = 0;
	this.sell_cnt = 0;
	for (var i = 0; i < this.labels.length; i++) {
		var label = this.getLabel(i);
		if (label == NON) {
			this.non_cnt++;
		} 
		else if (label == BUY) {
			this.buy_cnt++;
		}
		else if (label == SELL) {
			this.sell_cnt++;
		}
	}
}

LabelClassifyS2.prototype.nextDiffPos = function(pos, label)
{
	while (pos >= 0) {
		if (this.getLabel(pos) != label) {
			break;
		}
		pos--;
	}
	return pos;
}

LabelClassifyS2.prototype.reDefLabelLimit = function(symbol, period, dtFrom, count, ud)
{
	var pbList = _GetLaterPriceBarFromLocal(symbol, period, dtFrom.toString(), count);
	var ret = DefPLOnLimit(pbList, ud, this.pl_max);
	if (this.pl_min >= ret.max_loss && this.pl_max <= ret.max_profit) {
		ret.ud = ud;
	}
	else {
		ret.ud = NON;
	}
	return ret;
}

LabelClassifyS2.prototype.classify = function(symbol, period, timestamps)
{
	// Only NON labels that have been changed to NON in the previous process
	for (var i = 0; i < this.labels.length; i++) {
		if (this.labels[i].substr(0, 1) == NON && this.labels[i].length > 1) {
			this.labels[i] = NON;
		}
	}

	// From cur to end, set labels with PL for a certain period in the future
	var prev = this.labels.length - 1;
	var cur = this.nextDiffPos(this.labels.length - 1, NON);
	while (cur >= 0) {
		var end = this.nextDiffPos(cur - 1, this.getLabel(cur));
		var next = end;
		if (end >= 0 && this.getLabel(end) == NON) {
			next = this.nextDiffPos(end - 1, NON);
		}

		var pred_ok = false;
		var defs = [];
		var label = this.getLabel(cur);
		for (var i = end + 1; i <= cur; i++) {
			var dtFrom = Str2Date(timestamps[i]);
			var pl_num = this.pl_num == 0 ? prev - i : this.pl_num;
			var defLabel = this.reDefLabelLimit(symbol, period, dtFrom, pl_num, label);
			_Print("[reDefLabelLimit] from:%s count:%d %s=>%s\n", dtFrom.toString(), pl_num, label, defLabel.ud);
			defs.push(defLabel);
			if (defLabel.ud != NON) {
				pred_ok = true;
			}
		}

		if (!pred_ok) {
			label = NON;
		}
		for (var j = end + 1; j <= cur; j++) {
			var pl_num = this.pl_num == 0 ? prev - j : this.pl_num;
			this.labels[j] = label + ':' + pl_num + ':'
				+ parseInt(defs[j-(end+1)].max_profit / this.point_size) + ':'
				+ parseInt(defs[j-(end+1)].max_loss / this.point_size) + ':'
				+ defs[j-(end+1)].pos_diff;
		}

		cur = next;
		if (pred_ok) {
			prev = end + 1;
		}
	}
}

//============================================================================================

function LabelClassifyS3()
{
}

LabelClassifyS3.prototype.init = function()
{
	this.labels = [];
	this.non_cnt = 0;
	this.buy_cnt = 0;
	this.sell_cnt = 0;
	this.buy_min_count = 10000;
	this.buy_max_count = 0;
	this.sell_min_count = 10000;
	this.sell_max_count = 0;
	this.non_diff_min_count = 10000;
	this.non_diff_max_count = 0;
	this.non_same_min_count = 10000;
	this.non_same_max_count = 0;
}

LabelClassifyS3.prototype.nextDiffPos = function(pos, label)
{
	while (pos < this.labels.length) {
		if (this.labels[pos] != label) {
			break;
		}
		pos++;
	}
	return pos;
}

// Remove s2 label information
LabelClassifyS3.prototype.clean = function()
{
	for (var i = 0; i < this.labels.length; i++) {
		this.labels[i] = this.labels[i].substr(0, 1);
	}	
}

// Summary label information
LabelClassifyS3.prototype.summary = function()
{
	for (var i = 0; i < this.labels.length; i++) {
		if (this.labels[i] == NON) {
			this.non_cnt++;
		}
		else if (this.labels[i] == BUY) {
			this.buy_cnt++;
		}
		else if (this.labels[i] == SELL) {
			this.sell_cnt++;
		}
	}	

	var cur = this.nextDiffPos(0, NON);
	while (cur < this.labels.length) {
		var end = this.nextDiffPos(cur + 1, this.labels[cur]);
		var next = end;
		if (end < this.labels.length && this.labels[end] == NON) {
			next = this.nextDiffPos(end + 1, NON);
		}

		if (this.labels[cur] == BUY) {
			if (end - cur < this.buy_min_count) {
				this.buy_min_count = end - cur;
			}
			if (end - cur > this.buy_max_count) {
				this.buy_max_count = end - cur;
			}
		}
		else if (this.labels[cur] == SELL) {
			if (end - cur < this.sell_min_count) {
				this.sell_min_count = end - cur;
			}
			if (end - cur > this.sell_max_count) {
				this.sell_max_count = end - cur;
			}
		}

		if (this.labels[cur] == this.labels[next]) {
			if (next - cur < this.non_same_min_count) {
				this.non_same_min_count = next - cur;
			}
			if (next - cur > this.non_same_max_count) {
				this.non_same_max_count = next - cur;
			}
		}
		else {
			if (next - cur < this.non_diff_min_count) {
				this.non_diff_min_count = next - cur;
			}
			if (next - cur > this.non_diff_max_count) {
				this.non_diff_max_count = next - cur;
			}
		}
		
		cur = next;
	}
}

