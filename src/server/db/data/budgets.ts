import fs from "node:fs";
import Papa from "papaparse";
import { Range, RANGE_LB_INC } from "postgres-range";

import { type DB_BudgetInsertType } from "../schema/budgets";
import { type BudgetPeriod } from "../schema/enum";
import { TimezoneRange } from "../utils";

// Expected Type
type CSV_BudgetType = {
  id: string;
  categoryId: string;
  amount: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string | null;
  userId: string;
};

const mapParsedRow = (row: CSV_BudgetType) => {
  const { startDate, endDate, ...rest } = row;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  return {
    ...rest,
    sysPeriod: new TimezoneRange(new Range<Date>(start, end, RANGE_LB_INC)),
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
