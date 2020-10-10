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

OpenTrade.prototype.MacdCross = function()
{
	var methodName = "MacdCross"
	if (!this.isDefMethod(methodName)) {
		return "";
	}

	var methodObj = _GetMethod(this.symbol, methodName);
	if (methodObj === undefined) {
		_Log.error(methodName + " is not defined.");
		return "";
	}

	var period = methodObj.getAttr("period");
	var macd = _TA("MACD", this.symbol, period, "AskClose", 12, 26, 9);
	var macd_ =  GetCrossByMacdEx(macd, 0, 3, -1);
	var stoch = _TA("STOCH", this.symbol, period, "Ask", 73, 19, "TA_MAType_EMA", 19, "TA_MAType_EMA");
	var stoch_ = GetCrossByStoch(stoch, 0);

	var bs = "";
	if (macd_.crossPos == 0 && macd_.ud == stoch_.ud && IsRevZone(stoch_.ud, stoch_.crossK, 20, 80)) {
		var stop = parseInt(methodObj.getAttr("stop"));
		var limit = parseInt(methodObj.getAttr("limit"));
		if (stoch_.ud == 1) {
			var offer = _GetOffer(this.symbol, "Ask");
			this.stop = stop > 0 ? offer - stop * this.pointSize : 0;
			this.limit = limit > 0 ? offer + limit * this.pointSize : 0;
			bs = "B";
		}
		else if (stoch_.ud == -1) {
			var offer = _GetOffer(this.symbol, "Bid");
			this.stop = stop > 0 ? offer + stop * this.pointSize : 0;
			this.limit = limit > 0 ? offer - limit * this.pointSize : 0;
			bs = "S";
		}
		this.tradeMethodPeriod = period;
		this.tradeMethodName = methodName;
		this.trailMoveName = methodObj.getAttr("trailname");

		this.title = "MacdUD,MacdCrossPos,MacdCrossMacd,StochUD,StochCrossPos,StochCrossK";
		this.pred = [macd_.ud, macd_.crossPos, macd_.crossMacd, stoch_.ud, stoch_.crossPos, stoch_.crossK];
	}

	return bs;
}
