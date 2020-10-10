/****************************************************
 * Copyright (c) 2020 FXDaemon All Rights Reserved. *
 ****************************************************/

"use strict";

var _PRICE = 0, _MACD = 1, _STOCH = 2;
var _SIG_TYPE = [_PRICE, _PRICE, _PRICE, _PRICE,
	_MACD, _MACD, _MACD, _STOCH, _STOCH];

var _GRAY_SCALE_255 = 255;
var _GRAY_SCALE_S = 224;
var _GRAY_SCALE_S1 = 192;
var _GRAY_SCALE_S2 = 160;
var _GRAY_SCALE_S3 = 128;
var _GRAY_SCALE_S4 = 96;
var _GRAY_SCALE_M = 64;
var _GRAY_SCALE_L = 32;
var _SIG_GRAY_SCALE = [
	[_GRAY_SCALE_S1, _GRAY_SCALE_S2, _GRAY_SCALE_S3, _GRAY_SCALE_S4, 
		_GRAY_SCALE_S, _GRAY_SCALE_S, _GRAY_SCALE_S, _GRAY_SCALE_S, _GRAY_SCALE_S],
	[_GRAY_SCALE_M, _GRAY_SCALE_M, _GRAY_SCALE_M, _GRAY_SCALE_M, 
		_GRAY_SCALE_M, _GRAY_SCALE_M, _GRAY_SCALE_M, _GRAY_SCALE_M, _GRAY_SCALE_M],
	[_GRAY_SCALE_L, _GRAY_SCALE_L, _GRAY_SCALE_L, _GRAY_SCALE_L, 
		_GRAY_SCALE_L, _GRAY_SCALE_L, _GRAY_SCALE_L, _GRAY_SCALE_L, _GRAY_SCALE_L]];

var _SIG_TEXT = ['price_open', 'price_close', 'price_high', 'price_low',
	'macd_macd', 'macd_signal', 'macd_hist', 'stoch_slowk', 'stoch_slowd'];
var _DELIMIT = ",";

function _round(n)
{
	var fo = Math.floor(n); 
	return fo % 2 == 0 && n - fo <= 0.5 ? fo : Math.round(n);
}

// Standardize X  to range [0, multiple]
function _std_linear_p(lst, multiple)
{
  var s_max = Math.max.apply(null, lst);
	var s_min = Math.min.apply(null, lst);
	for (var i = 0; i < lst.length; i++) {
		lst[i] = (lst[i] - s_min) / (s_max - s_min) * multiple;
	}
	return lst;
}

// Standardize X  to range [-multiple/2, multiple/2]
function _std_linear_mp(lst, multiple)
{
  var s_max = Math.max.apply(null, lst);
  var s_min = Math.min.apply(null, lst);
	var abs_max = Math.abs(s_max) >= Math.abs(s_min) ? Math.abs(s_max) : Math.abs(s_min);
	for (var i = 0; i < lst.length; i++) {
		lst[i] = lst[i] / abs_max * (multiple / 2);
	}
	return lst;
}

function _draw(canvas, signal, base_line, gray_scales, interpolation, image_width)
{
	var i, col, cur, dif, prev, half, d, v;
	for (i = 0; i < signal.length; i += image_width) {
		var gray_scale = gray_scales[parseInt(i / image_width)]
		for (col = 0; col < image_width; col++) {
			cur = parseInt(base_line - _round(signal[i+col]));
			canvas[cur][col] = gray_scale;
			if (interpolation && col > 0) {
				dif = cur - prev;
				half = Math.abs(parseInt(dif / 2));
				for (d = 1; d < Math.abs(dif); d++) {
					v = prev + d * Math.sign(dif);
					if (d <= half) {
						canvas[v][col - 1] = gray_scale;
					}
					else {
						canvas[v][col] = gray_scale;
					}
				}
			}
			prev = cur;
		}
	}
}

function GetDrawflags(draw_singals)
{
	var draw_flags = (new Array(_SIG_TYPE.length)).fill(false);
	var _draw_singals = draw_singals.split(_DELIMIT);
	_draw_singals.forEach(sig => {
		var idx = _SIG_TEXT.findIndex(val => {
			return val == sig ? true : false;
		});
    	if (idx >= 0) {
			draw_flags[idx] = true;
		}
	});
  return draw_flags;
}

function DrawBitmap(canvas, signals, draw_singals, gray_scales, interpolation, image_height, image_width)
{
	if (canvas.length == 0) {
		for(var i = 0; i < image_height; i++){
			canvas[i] = [];
			for(var j = 0; j < image_width; j++){
				canvas[i][j] = 0;
			}
		}
	}

	var price=[], macd=[], stoch=[];
	var sig_gray_scales = [];
	var draw_flags = GetDrawflags(draw_singals);
	for (var i = 0; i < signals.length; i++) {
		var lst = signals[i].slice(image_width * -1);
    	if (draw_flags[i]) {
			var is_draw = true;
      		if (_SIG_TYPE[i] == _PRICE) {
				price = price.concat(lst);
			}
			else if (_SIG_TYPE[i] == _MACD) {
				macd = macd.concat(lst);
			}
			else if (_SIG_TYPE[i] == _STOCH) {
				stoch = stoch.concat(lst);
			}
			else {
				is_draw = false;
			}
			if (is_draw) {
				sig_gray_scales.push(gray_scales[i]);
			}
		}
	}

	var len_price = price.length;
	var p_list = _std_linear_p(price, 100);
	price = p_list.slice(0, len_price);
	macd = _std_linear_mp(macd, 100);

	var middle_line = image_height / 2;
	var price_base_line = 100 + 2;
	var stoch_base_line = image_height - 2;

	var get_gray_scales = (function () {
		var pos = 0;
		return function (signals) {
		  var count = parseInt(signals.length / image_width);
		  var _gray_scales = sig_gray_scales.slice(pos, pos + count);
				pos += count;
				return _gray_scales;
		};
	}());
	
	_draw(canvas, price, price_base_line, get_gray_scales(price), false, image_width);
	_draw(canvas, macd, middle_line, get_gray_scales(macd), interpolation, image_width);
	_draw(canvas, stoch, stoch_base_line, get_gray_scales(stoch), interpolation, image_width);
	return canvas;
}

function ConvertBitmap(canvas)
{
	return Array.prototype.concat.apply([], canvas);
}
