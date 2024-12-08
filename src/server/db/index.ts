import "dotenv/config";

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import ws from "ws";

import { env } from "~/env";
import * as accounts from "./schema/accounts";
import * as budgets from "./schema/budgets";
import * as budgetsToCategories from "./schema/budgets-to-categories";
import * as categories from "./schema/categories";
import * as connections from "./schema/connections";
import * as groups from "./schema/groups";
import * as institutions from "./schema/institutions";
import * as rules from "./schema/rules";
import * as tokens from "./schema/tokens";
import * as transactions from "./schema/transactions";
import * as transactionsToCategories from "./schema/transactions-to-categories";
import * as users from "./schema/users";
import * as usersToGroups from "./schema/users-to-groups";
import * as workspaceToAccounts from "./schema/workspace-to-accounts";

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
  ...budgetsToCategories,
  ...categories,
  ...connections,
  ...groups,
  ...institutions,
  ...rules,
  ...tokens,
  ...transactionsToCategories,
  ...transactions,
  ...users,
  ...usersToGroups,
  ...workspaceToAccounts,
};

export const sql = neon(connectionString);
export const db = drizzle({
  client: sql,
  schema,
  logger: env.NODE_ENV !== "production",
  casing: "snake_case",
});
