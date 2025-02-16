import { Redis } from "@upstash/redis";

import { env } from "~/env";

/**
 * Cache the redis connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForRedis = globalThis as unknown as {
  conn: Redis | undefined;
};

const conn =
  globalForRedis.conn ??
  new Redis({
    url: env.KV_REST_API_URL,
    token: env.KV_REST_API_TOKEN,
  });
if (env.NODE_ENV !== "production") globalForRedis.conn = conn;

export const redis = conn;
