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
// eslint-disable-next-line drizzle/enforce-delete-with-where
await db.delete(schema.institutions);
await db.insert(schema.institutions).values(institutionsMock);
// eslint-disable-next-line drizzle/enforce-delete-with-where
await db.delete(schema.accounts);
await db.insert(schema.accounts).values(accountsMock);
// eslint-disable-next-line drizzle/enforce-delete-with-where
await db.delete(schema.balances);
await db.insert(schema.balances).values(balancesMock);

// eslint-disable-next-line drizzle/enforce-delete-with-where
await db.delete(schema.pensionFunds);
await db.insert(schema.pensionFunds).values(pensionFundsMock);
console.log("Seed done");

// closing connection
await queryClient.end();
