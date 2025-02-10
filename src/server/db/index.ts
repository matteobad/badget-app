import "dotenv/config";

import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleWs } from "drizzle-orm/neon-serverless";
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

let connectionString = env.DATABASE_URL;

// Configuring Neon for local development
// https://neon.tech/guides/local-development-with-neon#local-postgresql
if (env.NODE_ENV === "development") {
  connectionString = `postgres://postgres:postgres@db.localtest.me:5432/main`;
  neonConfig.fetchEndpoint = (host) => {
    const [protocol, port] =
      host === "db.localtest.me" ? ["http", 4444] : ["https", 443];
    return `${protocol}://${host}:${port}/sql`;
  };
  const connectionStringUrl = new URL(connectionString);
  neonConfig.useSecureWebSocket =
    connectionStringUrl.hostname !== "db.localtest.me";
  //@ts-expect-error bad typings
  neonConfig.wsProxy = (host) =>
    host === "db.localtest.me" ? `${host}:4444/v1` : undefined;
  neonConfig.webSocketConstructor = ws;
}

const sql = neon(connectionString);
const pool = new Pool({ connectionString });

// Drizzle supports both HTTP and WebSocket clients. Choose the one that fits your needs:
// HTTP Client:
// - Best for serverless functions and Lambda environments
// - Ideal for stateless operations and quick queries
// - Lower overhead for single queries
// - Better for applications with sporadic database access
export const drizzleClientHttp = drizzleHttp({
  client: sql,
  schema,
  logger: env.NODE_ENV !== "production",
  casing: "snake_case",
});

// WebSocket Client:
// - Best for long-running applications (like servers)
// - Maintains a persistent connection
// - More efficient for multiple sequential queries
// - Better for high-frequency database operations
export const drizzleClientWs = drizzleWs({
  client: pool,
  schema,
  logger: env.NODE_ENV !== "production",
  casing: "snake_case",
});

export const db = drizzleClientHttp;
