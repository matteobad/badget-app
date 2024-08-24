import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import { schema } from ".";
import { getInstitutions } from "../tasks/get-institutions";
import { buildConflictUpdateColumns } from "./utils";

// import { DEFAULT_CATEGORIES } from "./data/categories";

const queryClient = postgres(env.POSTGRES_URL);
const db = drizzle(queryClient);

console.log("Seed start");

// eslint-disable-next-line drizzle/enforce-delete-with-where
// await db.delete(schema.categories);
// await db.insert(schema.categories).values(
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

const documents = await getInstitutions();

try {
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db
    .insert(schema.institutions)
    .values(
      documents.map((doc) => {
        return {
          id: doc.id,
          name: doc.name,
          logo: doc.logo,
          provider: doc.provider,
          popularity: doc.popularity,
          availableHistory: doc.available_history,
        } satisfies typeof schema.institutions.$inferInsert;
      }),
    )
    .onConflictDoUpdate({
      target: schema.institutions.id,
      set: buildConflictUpdateColumns(schema.institutions, [
        "name",
        "logo",
        "availableHistory",
      ]),
    });
} catch (error) {
  // @ts-expect-error no typings
  console.log(error.importResults);
}

console.log("Seed done");

// closing connection
await queryClient.end();
