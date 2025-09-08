import fs from "node:fs";
import { type dynamicIconImports } from "lucide-react/dynamic";
import Papa from "papaparse";

import type { CategoryType } from "../../../shared/constants/enum";
import type { DB_TransactionCategoryInsertType } from "../schema/transactions";

// Expected Type
type CSV_CategoryType = {
  id: string;
  type: CategoryType;
  name: string;
  slug: string;
  color: string;
  icon: string;
  description: string;
  parentId: string;
  depth: number;
  organizationId: string;
};

const mapParsedRow = (row: CSV_CategoryType) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { depth, ...rest } = row;

  return {
    ...rest,
  } satisfies DB_TransactionCategoryInsertType;
};

const file = fs.readFileSync("./src/server/db/data/categories.csv", "utf8");

const parsed = Papa.parse<CSV_CategoryType>(file, {
  delimiter: ",",
  dynamicTyping: true,
  header: true,
  skipEmptyLines: true,
});

const categoriesIds: string[] = [];
const categoriesMap: Record<number, DB_TransactionCategoryInsertType[]> = {
  0: [],
  1: [],
  2: [],
  // add more if needed
};

for (const row of parsed.data) {
  categoriesIds.push(row.id);
  categoriesMap[row.depth]?.push(mapParsedRow(row));
}

export { categoriesIds, categoriesMap };

export const categoryIcons = [
  "shopping-bag",
  "utensils",
  "car",
  "bus",
  "train",
  "plane",
  "home",
  "building",
  "dumbbell",
  "stethoscope",
  "pill",
  "heartbeat",
  "baby",
  "graduation-cap",
  "book",
  "briefcase",
  "coffee",
  "beer",
  "wine",
  "gift",
  "gamepad",
  "tv",
  "music",
  "headphones",
  "camera",
  "phone",
  "laptop",
  "server",
  "wrench",
  "tools",
  "credit-card",
  "banknote",
  "piggy-bank",
  "wallet",
  "receipt",
  "shopping-cart",
  "leaf",
  "sun",
  "flower",
  "paw-print",
  "hand-heart",
  "users",
  "globe",
  "plane-takeoff",
  "plane-landing",
  "file-text",
  "file-invoice",
  "alarm-clock",
  "calendar",
  "heart",
  "sparkles",
] as Array<keyof typeof dynamicIconImports>;
