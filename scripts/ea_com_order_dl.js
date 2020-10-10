/****************************************************
 * Copyright (c) 2020 FXDaemon All Rights Reserved. *
 ****************************************************/

"use strict";

function GetOpendTrades(symbol)
{
	var open_trades = {
		buy: [],
		sell: []
	};
	var openTradeList = _GetTradeListBySymbol(symbol);
	for (var i = 0; i < openTradeList.length; i++) {
    	if (openTradeList[i].isbuy) {
			open_trades.buy.push({
				id: openTradeList[i].id,
				opentime: openTradeList[i].opentime,
				method: _GetTradeMethodName(openTradeList[i].openOrderID)
			});
		} else {
			open_trades.sell.push({
				id: openTradeList[i].id,
				opentime: openTradeList[i].opentime,
				method: _GetTradeMethodName(openTradeList[i].openOrderID)
			});
		}
	}
	return open_trades;
}

//-----------------------------------------------------------------------------

function OpenTrade(symbol)
{
	this.symbol = symbol;
	this.pointSize = _GetPointSize(symbol);

	this.implKbn = this.getImplParam("ImplKbn");    // "1": buy  "2": sell  "3": buy or sell

	this.amount = 1;
	var _amount = this.getImplParam("Amount");
	if (_amount !== undefined) {
		this.amount = parseInt(_amount);;
	}

	this.orderStopFromWday = parseInt(_Params["OrderStopFromWday"]);
	this.orderStopFromHour = parseInt(_Params["OrderStopFromHour"]);
}

OpenTrade.prototype.getImplParam = function(name)
{
  return _Params[this.symbol + name];
}

OpenTrade.prototype.validation = function()
{
	if (this.implKbn == "0" || this.implKbn == "") {
		return false;
	}

	var dtNow = _CDate();
	if (dtNow.week > this.orderStopFromWday || (dtNow.week == this.orderStopFromWday && dtNow.hour >= this.orderStopFromHour)) {
		return false;
	}

	return true;
}

OpenTrade.prototype.getBitmap = function(periods, draw_singals, image_height, image_width)
{
  var bitmap = [];
  for (var i = 0; i < periods.length; i++) {
    var signals = [];
    signals.push(_GetPriceArray(this.symbol, periods[i], "AskOpen"));
    signals.push(_GetPriceArray(this.symbol, periods[i], "AskClose"));
    signals.push(_GetPriceArray(this.symbol, periods[i], "AskHigh"));
    signals.push(_GetPriceArray(this.symbol, periods[i], "AskLow"));

    var macd = _TA("MACD", this.symbol, periods[i], "AskClose", 12, 26, 9);
    signals.push(ArrayDivide(macd.macd, this.pointSize));
    signals.push(ArrayDivide(macd.signal, this.pointSize));
    signals.push(ArrayDivide(macd.hist, this.pointSize));

    var stoch = _TA("STOCH", this.symbol, periods[i], "Ask", 73, 19, "TA_MAType_EMA", 19, "TA_MAType_EMA");
    signals.push(stoch.slowk);
    signals.push(stoch.slowd);

    bitmap = DrawBitmap(bitmap, signals, draw_singals[i], _SIG_GRAY_SCALE[i], true, image_height, image_width);
  }
  return ConvertBitmap(bitmap);
}

OpenTrade.prototype.predict = function(model_name, bitmap, image_height, image_width, num_labels)
{
  this.pred = _TfClassify(model_name, bitmap, image_height, image_width, 1, num_labels);
  var bs = '';
  if (this.pred) {
    for (var i = 0; i < this.pred.length; i+=2) {
      // _Print("index:%d score:%f\n", this.pred[i], this.pred[i+1]);
      _Log.info("index:" + this.pred[i] + " score:" + this.pred[i+1]);
    }
    if (this.pred[0] % 2 != 0) {    // buy
      bs = 'B';
    }
    else if (this.pred[0] > 0 && this.pred[0] % 2 == 0) {    // sell
      bs = 'S';
    }
  }
  return bs;
}

OpenTrade.prototype.isDefMethod = function(method)
{
	var ret = false;
	for (var i = 1; i <= 8; i++) {
		if (this.getImplParam("OpenMethod" + i) == method) {
			ret = true;
			break;
		}
	}
	return ret;
}

OpenTrade.prototype.open = function(methodObj)
{ 
  var model_name = methodObj.getAttr("modelname");
  var periods = methodObj.getAttr("periods").split(',');
  var draw_signals = methodObj.getAttr("drawsignals").split(';');
  var image_size = methodObj.getAttr("imagesize").split(",");
  var num_labels = parseInt(methodObj.getAttr("numlabels"));

  var bitmap = this.getBitmap(periods, draw_signals, parseInt(image_size[0]), parseInt(image_size[1]));
  var bs = this.predict(model_name, bitmap, parseInt(image_size[0]), parseInt(image_size[1]), num_labels);
  if (bs != '') {
    var stop = parseInt(methodObj.getAttr("stop"));
    var limit = parseInt(methodObj.getAttr("limit"));
    if (bs == 'B') {
      var offer = _GetOffer(this.symbol, "Ask");
      this.stop = stop > 0 ? offer - stop * this.pointSize : 0;
      this.limit = limit > 0 ? offer + limit * this.pointSize : 0;
    }
    else if (bs == 'S') {
      var offer = _GetOffer(this.symbol, "Bid");
      this.stop = stop > 0 ? offer + stop * this.pointSize : 0;
      this.limit = limit > 0 ? offer - limit * this.pointSize : 0;
    }

    this.tradeMethodPeriod = periods[0];
    this.tradeMethodName = model_name;
    this.trailStopPeriod = periods[0];
    this.trailStopName = "";
    this.trailMoveTsName = methodObj.getAttr("trailname");
    
    if (!this.isDefMethod(this.tradeMethodName)) {
      bs = '';
    }
  }
  return bs;
}

