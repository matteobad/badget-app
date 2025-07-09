-- Custom SQL migration file, put your code below! --

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE badget_budget_table
ADD CONSTRAINT no_overlapping_budget_ranges
EXCLUDE USING gist (
  category_id WITH =,
  validity WITH &&
)
WHERE (override_for_budget_id IS NULL);
