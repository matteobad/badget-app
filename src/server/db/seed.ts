import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import { schema } from ".";
import { pensionFundsMock } from "./data/pension-fund";

const queryClient = postgres(env.DATABASE_URL);
const db = drizzle(queryClient);

console.log("Seed start");
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
await db.delete(schema.pensionFunds);
await db.delete(schema.pensionAccounts);
await db.delete(schema.investmentBranches);
await db.delete(schema.investmentBranchesPerf);

for (const [_, { investmentBranches, ...rest }] of pensionFundsMock) {
  const inserted = await db
    .insert(schema.pensionFunds)
    .values(rest)
    .returning({ insertedId: schema.pensionFunds.id });

  for (const investmentBranch of investmentBranches) {
    const insertedBranches = await db
      .insert(schema.investmentBranches)
      .values({
        ...investmentBranch,
        pensionFundId: inserted[0]?.insertedId,
      })
      .returning({ insertedId: schema.pensionFunds.id });

    await db.insert(schema.investmentBranchesPerf).values(
      investmentBranch.performances.map((perf) => {
        return {
          ...perf,
          investmentBranchId: insertedBranches[0]?.insertedId!,
        };
      }),
    );
  }
}

console.log("Seed done");

// closing connection
await queryClient.end();
