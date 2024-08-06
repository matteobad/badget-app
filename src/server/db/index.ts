import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import * as openBanking from "./schema/open-banking";
import * as pensionFund from "./schema/pension-funds";
import * as workingRecord from "./schema/working-records";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

// export insert and select types
export type PensionAccountInsert = typeof schema.pensionAccounts.$inferInsert;
export type PensionAccountSelect = typeof schema.pensionAccounts.$inferSelect;
export type PensionFundsSelect = typeof schema.pensionFunds.$inferSelect;
export type investmentBranchesSelect =
  typeof schema.investmentBranches.$inferSelect;

export const schema = {
  ...openBanking,
  ...pensionFund,
  ...workingRecord,
};
export const db = drizzle(conn, { schema });
