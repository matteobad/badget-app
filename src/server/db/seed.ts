import "dotenv/config";

import type { DB_AccountInsertType } from "./schema/accounts";
import type { DB_CategoryInsertType } from "./schema/categories";
import type { DB_ConnectionInsertType } from "./schema/open-banking";
import { db } from ".";
import { category_table } from "./schema/categories";
import { buildConflictUpdateColumns } from "./utils";

// import { DEFAULT_CATEGORIES } from "./data/categories";

// eslint-disable-next-line drizzle/enforce-delete-with-where
// await db.delete(schema.category);
// await db.insert(schema.category).values(
//   DEFAULT_CATEGORIES.map((c) => {
//     return {
//       ...c,
//       manual: false,
//       userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
//     };
//   }),
// );
// // eslint-disable-next-line drizzle/enforce-delete-with-where
// await db.delete(schema.institutions);
// await db.insert(schema.institutions).values(institutionsMock);
// // eslint-disable-next-line drizzle/enforce-delete-with-where
// await db.delete(schema.accounts);
// await db.insert(schema.accounts).values(accountsMock);
// // eslint-disable-next-line drizzle/enforce-delete-with-where
// await db.delete(schema.balances);
// await db.insert(schema.balances).values(balancesMock);

// eslint-disable-next-line drizzle/enforce-delete-with-where
// await db.delete(schema.pensionFunds);
// await db.delete(schema.pensionAccounts);
// await db.delete(schema.investmentBranches);
// await db.delete(schema.investmentBranchesPerf);

// for (const [_, { investmentBranches, ...rest }] of pensionFundsMock) {
//   const inserted = await db
//     .insert(schema.pensionFunds)
//     .values(rest)
//     .returning({ insertedId: schema.pensionFunds.id });

//   for (const investmentBranch of investmentBranches) {
//     const insertedBranches = await db
//       .insert(schema.investmentBranches)
//       .values({
//         ...investmentBranch,
//         pensionFundId: inserted[0]?.insertedId,
//       })
//       .returning({ insertedId: schema.pensionFunds.id });

//     await db.insert(schema.investmentBranchesPerf).values(
//       investmentBranch.performances.map((perf) => {
//         return {
//           ...perf,
//           investmentBranchId: insertedBranches[0]?.insertedId!,
//         };
//       }),
//     );
//   }
// }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CONNECTIONS_DATA: DB_ConnectionInsertType[] = [
  {
    institutionId: "n5doi0t2ubrvn7wtdjhrtf16",
    provider: "GOCARDLESS",
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
    referenceId: "d33ae4ee-6952-4e16-85c7-fa9c8bc0a2a5",
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ACCOUNTS_DATA: DB_AccountInsertType[] = [
  {
    name: "Revolut",
    balance: "0",
    currency: "EUR",
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
  {
    name: "N26",
    balance: "0",
    currency: "EUR",
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
  {
    name: "Hype",
    balance: "0",
    currency: "EUR",
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CATEGORY_DATA: DB_CategoryInsertType[] = [
  {
    name: "Incomes",
    slug: "income",
    color: "142.8 64.2% 24.1%", // green-800
    icon: "arrow-down-0-1",
    userId: null,
  },
  {
    name: "Expenses",
    slug: "outcome",
    color: "0 70% 35.3%", // red-800
    icon: "arrow-up-1-0",
    userId: null,
  },
  {
    name: "Savings & Investments",
    slug: "saving-investment",
    color: "272.9 67.2% 39.4%", // purple-800
    icon: "chart-candlestick",
    userId: null,
  },
  // {
  //   name: "Transfer",
  //   slug: "transfer",
  //   color: "0 0% 14.9%", // neutral-800
  //   icon: "arrow-down-up", // neutral-800
  //   userId: null,
  // },
];

async function main() {
  // await reset(db, schema);

  // await db.insert(connection_table).values(CONNECTIONS_DATA);
  // await db.insert(account_table).values(ACCOUNTS_DATA);
  await db
    .insert(category_table)
    .values(CATEGORY_DATA)
    .onConflictDoUpdate({
      target: [category_table.slug, category_table.userId],
      set: buildConflictUpdateColumns(category_table, ["color", "icon"]),
    });
  // await seed(db, schema, {
  //   count: 10,
  // });

  await db.$client.end();
}

await main();
