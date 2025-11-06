import { afterAll, afterEach, beforeEach, mock } from "bun:test";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { migrate } from "drizzle-orm/pglite/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { reset } from "drizzle-seed";
import postgres from "postgres";
import { db } from "~/server/db";
import { schema } from "../server/db/schema";

let container: StartedPostgreSqlContainer;

// Replace the database with a new in-memory database
await mock.module("../server/db", async () => {
  console.log("starting testcontainer");
  container = await new PostgreSqlContainer("postgres:17").start();
  console.log("testcontainer started");
  const connectionString = container.getConnectionUri();
  const client = postgres(connectionString);
  const db = drizzle(client, { logger: false, schema });
  console.log("drizzle db client created");

  return { client, db };
});

// Apply migrations before each test
beforeEach(async () => {
  await migrate(db, { migrationsFolder: "src/server/db/migrations" });
});

// Clean up the database after each test
afterEach(async () => {
  await reset(db, schema);
});

// Free up resources after all tests are done
afterAll(async () => {
  await container.stop();
});
