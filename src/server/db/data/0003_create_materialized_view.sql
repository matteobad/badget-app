-- Custom SQL migration file, put your code below! --

-- Crea la vista materializzata basata sulla funzione precedente
CREATE MATERIALIZED VIEW badget_budget_instances_mview AS
SELECT *
FROM generate_budget_instances();

-- Indicizza per performance sulle query per categoria/periodo
CREATE INDEX idx_budget_instances_category_period
  ON badget_budget_instances_mview (category_id, instance_from);
