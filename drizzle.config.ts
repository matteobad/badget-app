import { env } from "~/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/server/db/migrations",
  schema: "./src/server/db/schema",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
