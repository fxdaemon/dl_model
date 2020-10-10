select year(t.OpenTime) as Year, week(t.OpenTime) as Week, sum(t.PL) as Pl, count(*) as Count
from Trade t
where t.AccountID = @account_id
group by year(t.OpenTime), week(t.OpenTime)
