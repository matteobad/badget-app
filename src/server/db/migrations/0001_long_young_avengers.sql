-- Custom SQL migration file, put your code below! --

CREATE OR REPLACE FUNCTION public.get_expenses(p_organization_id text, p_date_from text, p_date_to text, p_base_currency text DEFAULT NULL::text)
 RETURNS TABLE(date text, value numeric, recurring_value numeric, currency text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT to_char(d, 'YYYY-MM') AS date_month
    FROM generate_series(
      date_trunc('month', p_date_from::date),
      date_trunc('month', p_date_to::date),
      interval '1 month'
    ) AS d
  ),
  expenses_by_month AS (
    SELECT
      to_char(date_trunc('month', t.date), 'YYYY-MM') AS date_month,
      SUM(t.amount) AS value,
      SUM(CASE WHEN t.recurring THEN t.amount ELSE 0 END) AS recurring_value
    FROM public.badget_transaction_table t
    WHERE t.organization_id = p_organization_id
      AND t.date >= p_date_from::DATE
      AND t.date <= p_date_to::DATE
      AND t.amount < 0 -- solo spese
    GROUP BY 1
  )
  SELECT
    m.date_month || '-01' AS date, -- ritorniamo 'YYYY-MM-01' come data canonica
    COALESCE(e.value, 0) AS value,
    COALESCE(e.recurring_value, 0) AS recurring_value,
    'EUR'::TEXT AS currency
  FROM months m
  LEFT JOIN expenses_by_month e ON e.date_month = m.date_month
  ORDER BY 1;
END;
$function$
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.get_net_worth(p_organization_id text, p_date_from date, p_date_to date, p_base_currency text DEFAULT NULL::text)
 RETURNS TABLE(date text, value numeric, currency text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(p_date_from, p_date_to, interval '1 day')::DATE AS date
  ),
  daily_net_worth AS (
    SELECT
      d.date,
      COALESCE(SUM(b.balance), 0) AS value,
      'EUR' AS currency
    FROM date_range d
    LEFT JOIN public.badget_account_balance_table b
      ON b.organization_id = p_organization_id AND b.date = d.date
    GROUP BY d.date
  )
  SELECT
    to_char(daily_net_worth.date, 'YYYY-MM-DD') AS date,
    daily_net_worth.value,
    daily_net_worth.currency
  FROM daily_net_worth
  ORDER BY date;
END;
$function$
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.get_spending(p_organization_id text, p_date_from text, p_date_to text, p_base_currency text DEFAULT NULL::text)
 RETURNS TABLE(name text, slug text, amount numeric, currency text, color text, icon text, percentage numeric)
 LANGUAGE sql
AS $function$
  WITH total_spending AS (
    SELECT SUM(t.amount) * -1 AS total
    FROM public.badget_transaction_table t
    WHERE t.organization_id = p_organization_id
      AND t.date BETWEEN p_date_from::DATE AND p_date_to::DATE
      AND t.amount < 0
  ),
  per_category AS (
    SELECT
      c.name,
      c.slug,
      c.color,
      c.icon,
      SUM(t.amount) * -1 AS amount
    FROM public.badget_transaction_table t
    JOIN public.badget_category_table c ON c.id = t.category_id
    WHERE t.organization_id = p_organization_id
      AND t.date BETWEEN p_date_from::DATE AND p_date_to::DATE
      AND t.amount < 0
    GROUP BY c.id
  )
  SELECT
    pc.name,
    pc.slug,
    pc.amount,
    'EUR'::TEXT AS currency,
    pc.color,
    pc.icon,
    CASE
      WHEN ts.total = 0 THEN 0
      ELSE ROUND(pc.amount / ts.total * 100, 4)
    END AS percentage
  FROM per_category pc, total_spending ts
  ORDER BY pc.amount DESC;
$function$
