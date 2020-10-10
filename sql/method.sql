select t.Symbol as Symbol, ts.TradeMethodName as Method, sum(t.PL) as Pl, count(*) as Count
from Trade t, TsContext ts
where t.AccountID = @account_id
and t.AccountID = ts.AccountID
and t.TradeID = ts.TradeID
group by t.Symbol, ts.TradeMethodName
