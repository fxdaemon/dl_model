select t.Symbol as Symbol, sum(t.PL) as Pl, count(*) as Count
from Trade t
where t.AccountID = @account_id
group by Symbol
