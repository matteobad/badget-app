import "dotenv/config";

import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { env } from "~/env";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleWs } from "drizzle-orm/neon-serverless";
import ws from "ws";

import * as accounts from "./schema/accounts";
import * as auth from "./schema/auth";
import * as categories from "./schema/categories";
import * as openBanking from "./schema/open-banking";
import * as transactions from "./schema/transactions";

let connectionString = env.DATABASE_URL;

// necessary on trigger.dev env
neonConfig.webSocketConstructor = ws;

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

export const schema = {
  ...auth,
  ...accounts,
  ...categories,
  ...openBanking,
  ...transactions,
};

// Drizzle supports both HTTP and WebSocket clients. Choose the one that fits your needs:
// HTTP Client:
// - Best for serverless functions and Lambda environments
// - Ideal for stateless operations and quick queries
// - Lower overhead for single queries
// - Better for applications with sporadic database access
export const drizzleClientHttp = drizzleHttp({
  client: sql,
  schema,
  logger: false, // env.NODE_ENV !== "production",
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
  logger: false, // env.NODE_ENV !== "production",
  casing: "snake_case",
});

export const db = drizzleClientWs;

// Helper type for database client
export type DBType = typeof db;
export type TXType = Parameters<Parameters<DBType["transaction"]>[0]>[0];
export type DBClient = DBType | TXType;

// Helper function to run transactions
export async function withTransaction<T>(
  callback: (tx: TXType) => Promise<T>,
): Promise<T> {
  return db.transaction(callback);
}
