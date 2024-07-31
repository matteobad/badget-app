import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import { schema } from ".";
import {
  accountsMock,
  balancesMock,
  institutionsMock,
} from "./data/open-banking.mock";
import { pensionFundsMock } from "./data/pension-fund.mock";

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
// eslint-disable-next-line drizzle/enforce-delete-with-where
await db.delete(schema.investmentBranches);

for (const [_, { investmentBranches, ...rest }] of pensionFundsMock) {
  const inserted = await db
    .insert(schema.pensionFunds)
    .values(rest)
    .returning({ insertedId: schema.pensionFunds.id });

  await db.insert(schema.investmentBranches).values(
    investmentBranches.map((iv) => {
      return {
        ...iv,
        pensionFundId: inserted[0]?.insertedId,
      };
    }),
  );
}

console.log("Seed done");

// closing connection
await queryClient.end();
