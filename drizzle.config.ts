import "dotenv/config";

import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  casing: "snake_case",
  dialect: "postgresql",
  out: "./src/server/db/migrations",
  schema: "./src/server/db/schema",
} satisfies Config;
