import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import ws from "ws";

import { env } from "~/env";
import * as accounts from "./schema/accounts";
import * as budgets from "./schema/budgets";
import * as categories from "./schema/categories";
import * as connections from "./schema/connections";
import * as institutions from "./schema/institutions";
import * as rules from "./schema/rules";
import * as tokens from "./schema/tokens";
import * as transactions from "./schema/transactions";
import * as transactionsToCategories from "./schema/transactions-to-categories";

let connectionString = env.DATABASE_URL;

// Configuring Neon for local development
if (env.NODE_ENV === "development") {
  connectionString = "postgres://postgres:postgres@db.localtest.me:5432/main";
  neonConfig.fetchEndpoint = (host) => {
    const [protocol, port] =
      host === "db.localtest.me" ? ["http", 4444] : ["https", 443];
    return `${protocol}://${host}:${port}/sql`;
  };
  const connectionStringUrl = new URL(connectionString);
  neonConfig.useSecureWebSocket =
    connectionStringUrl.hostname !== "db.localtest.me";
  neonConfig.wsProxy = (host) =>
    host === "db.localtest.me" ? `${host}:4444/v1` : "";
  neonConfig.webSocketConstructor = ws;
}

export const schema = {
  ...accounts,
  ...budgets,
  ...categories,
  ...connections,
  ...institutions,
  ...rules,
  ...tokens,
  ...transactionsToCategories,
  ...transactions,
};

export const sql = neon(connectionString);
export const db = drizzle({ client: sql, schema, casing: "snake_case" });
