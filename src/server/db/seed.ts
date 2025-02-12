import "dotenv/config";

import { reset } from "drizzle-seed";

import type { DB_AccountInsertType } from "./schema/accounts";
import { db, schema } from ".";
import { account_table as accountSchema } from "./schema/accounts";

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

async function main() {
  await reset(db, schema);

  await db.insert(accountSchema).values(ACCOUNTS_DATA);
  // await seed(db, schema, {
  //   count: 10,
  // });
}

await main();
