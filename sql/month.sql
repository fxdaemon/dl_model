select year(t.OpenTime) as Year, month(t.OpenTime) as Month, sum(t.PL) as Pl, count(*) as Count
from Trade t
where t.AccountID = @account_id
group by year(t.OpenTime), month(t.OpenTime)
