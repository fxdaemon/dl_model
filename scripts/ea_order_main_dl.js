/****************************************************
 * Copyright (c) 2020 FXDaemon All Rights Reserved. *
 ****************************************************/

"use strict";

var order_funcs = [];

/*
 * Run only once before [order_open]
 * symbol: "COM1"
 */
order_funcs.order_pre = function(symbol)
{
	// Get execution plan from DB
	_LoadImplPlan("ImplKbn", "Amount", "OpenMethod1", "OpenMethod2");

	var loadMethod = _GetMethod(symbol, "LoadContext");
	if (loadMethod !== undefined) {
		_Params["OrderStopFromWday"] = loadMethod.getAttr("orderstop_from_wday");
		_Params["OrderStopFromHour"] = loadMethod.getAttr("orderstop_from_hour");
	}

	var dtNow = _CDate();
	_Params["servertime"] = dtNow.time;
}

/*
 * Executed on a symbol
 * symbol: "EUR/JPY", "EUR/USD", "USD/JPY"
 */
order_funcs.order_open = function(symbol)
{
	var spread = _GetSpread(symbol);
	if (spread > 10) {
		_Log.info("[order_return]" + symbol + " spread:" + spread);
		return;
	}
	_Log.info("[order_open]" + symbol + " spread:" + spread);

	var orderMethodList = _GetMethods(symbol);
	if (orderMethodList === undefined) {
		_Log.error(this.symbol + " is not defined in implparam.");
		return;
	}

	var bs = '';
	var openTrade = new OpenTrade(symbol);
	// check trade condition
	if (!openTrade.validation()) {
		return;
	}
	for (var i = 0; i < orderMethodList.length; i++) {
		bs = openTrade.open(orderMethodList[i]);
		if (bs != '') {
			break;
		}
	}

	if (bs != '') {
		// Get opened trade
		var openedTrades = GetOpendTrades(symbol);
		if (bs == 'B' && openTrade.implKbn == '2' || bs == 'S' && openTrade.implKbn == '1') {
			return;
		}
    
		var openedTrades_bs = [];
		if (bs == 'B') {
			openedTrades_bs = openedTrades.buy;
		}
		else if (bs == 'S') {
			openedTrades_bs = openedTrades.sell;
		}
		for (var i = 0; i < openedTrades_bs.length; i++) {
			// Do not open the same position within 8 hours
			if (openTrade.tradeMethodName == openedTrades_bs[i].method &&
				(parseInt(_Params["servertime"]) - openedTrades_bs[i].opentime) / _GetTimeByPeriod(openTrade.tradeMethodPeriod) < 32) {
				return;
			}
		}

		// To open position
		var orderId = _OpenMarketOrder(symbol, bs, openTrade.amount, openTrade.stop, openTrade.limit);
		// Set TsContext
		var title = "";
		for (var i = 0; i < openTrade.pred.length / 2; i++) {
			title += (title.length > 0 ? ',' : '') + "INDEX_" + (i + 1) + ",SCORE_" + (i + 1);
		}
		_SetTsContext(orderId, 'S', "", title, openTrade.pred);
		_SetTsContextTrail(orderId, 'S', openTrade.tradeMethodPeriod, openTrade.tradeMethodName, openTrade.trailStopPeriod, openTrade.trailStopName, openTrade.trailMoveTsName);
		//_OutPriceBar(symbol, openTrade.tradeMethodPeriod);
	}
}

/*
 * Run only once after [order_open]
 * symbol: "COM9"
 */
order_funcs.order_flw = function(symbol)
{
	var dtNow = _CDate();
	//_WriteFile("servertime", dtNow.toString(), "1");

	var closeMethod = _GetMethod(symbol, "CloseAll");
	if (closeMethod !== undefined) {
		// Close all positions before the market is closed
		if (dtNow.week == closeMethod.getAttr("close_wday") && dtNow.hour >= closeMethod.getAttr("close_hour")) {
			_Log.info("Now:[" + dtNow.toString() + "] MarketClose to CloseAllTrade.");
			_CloseAllTrade();
		}
	}
}

/*
 * The main() function run every period (15 minutes etc)
 * symbol: "COM1", "EUR/JPY", "EUR/USD", "USD/JPY", "COM9"
 */
function _main(symbol)
{
	var implparam = _GetImplParam(symbol);
	if (implparam === undefined) {
		_Log.error(symbol + " implparam is not defined.");
		return;
	}
	order_funcs[implparam.getAttr("name")](symbol);
}

/*
 * Called when market data changes
 * symbol: "EUR/JPY", "EUR/USD", "USD/JPY"
 */
function _tick(symbol)
{
}
