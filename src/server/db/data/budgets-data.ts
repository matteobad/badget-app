import fs from "node:fs";
import Papa from "papaparse";
import { Range, RANGE_LB_INC } from "postgres-range";

import type { DB_BudgetInsertType } from "./budgets";
import { type BudgetRecurrenceType } from "../../../shared/constants/enum";
import { TimezoneRange } from "../utils";

// Expected Type
type CSV_BudgetType = {
  id: string;
  category_id: string;
  amount: string;
  recurrence: BudgetRecurrenceType;
  recurrence_end: string | null;
  start_date: string;
  end_date: string;
  override_for_budget_id: string | null;
  userId: string;
};

const mapParsedRow = (row: CSV_BudgetType) => {
  const { start_date, end_date } = row;
  const start = new Date(start_date);
  const end = end_date ? new Date(end_date) : null;

  return {
    userId: row.userId,
    categoryId: row.category_id,
    overrideForBudgetId: row.override_for_budget_id,
    recurrenceEnd: row.recurrence_end ? new Date(row.recurrence_end) : null,
    recurrence: row.recurrence,
    amount: parseInt(row.amount, 10),
    validity: new TimezoneRange(new Range<Date>(start, end, RANGE_LB_INC)),
  } satisfies DB_BudgetInsertType;
};

const file = fs.readFileSync("./src/server/db/data/budgets.csv", "utf8");

const parsed = Papa.parse<CSV_BudgetType>(file, {
  delimiter: ",",
  dynamicTyping: true,
  header: true,
  skipEmptyLines: true,
});

const budgetsIds: string[] = [];
const budgetList: DB_BudgetInsertType[] = [];

for (const row of parsed.data) {
  budgetsIds.push(row.id);
  budgetList.push(mapParsedRow(row));
}

export { budgetList, budgetsIds };
