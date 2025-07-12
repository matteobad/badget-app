-- Custom SQL migration file, put your code below! --

-- Estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Funzione che genera istanze ricorrenti
CREATE OR REPLACE FUNCTION generate_budget_instances()
RETURNS TABLE (
  id UUID,
  original_budget_id UUID,
  category_id UUID,
  user_id VARCHAR(32),
  amount INTEGER,
  instance_from DATE,
  instance_to DATE
)
AS $$
BEGIN
  RETURN QUERY

  -- 1. Istanze generate da budget ricorrenti
  SELECT
    gen_random_uuid() AS id,
    b.id AS original_budget_id,
    b.category_id,
    b.user_id,
    b.amount,
    gs::date AS instance_from,
    (gs + (upper(b.validity) - lower(b.validity)))::date AS instance_to
  FROM public.badget_budget_table b,
    generate_series(
      lower(b.validity),
      COALESCE(b.recurrence_end, CURRENT_DATE + INTERVAL '1 year'),
      CASE b.recurrence
        WHEN 'daily' THEN INTERVAL '1 day'
        WHEN 'weekly' THEN INTERVAL '1 week'
        WHEN 'monthly' THEN INTERVAL '1 month'
        WHEN 'quarterly' THEN INTERVAL '3 months'
        WHEN 'yearly' THEN INTERVAL '1 year'
        ELSE INTERVAL '1 day' -- fallback di sicurezza
      END
    ) AS gs
  WHERE b.recurrence IS NOT NULL
    -- escludi istanze override
    AND NOT EXISTS (
      SELECT 1
      FROM public.badget_budget_table override
      WHERE override.override_for_budget_id = b.id
        AND gs >= lower(override.validity)
        AND gs < upper(override.validity)
    )

  UNION ALL

  -- 2. Budget override (singoli, non ricorrenti)
  SELECT
    gen_random_uuid() AS id,
    b.override_for_budget_id AS original_budget_id,
    b.category_id,
    b.user_id,
    b.amount,
    lower(b.validity)::date AS instance_from,
    upper(b.validity)::date AS instance_to
  FROM public.badget_budget_table b
  WHERE b.override_for_budget_id IS NOT NULL;

END;
$$ LANGUAGE plpgsql;
