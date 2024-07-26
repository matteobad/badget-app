import { serial, timestamp, varchar } from "drizzle-orm/pg-core";

import { createTable } from "./_table";

export const post = createTable("post", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  title: varchar("name", { length: 256 }).notNull(),
  content: varchar("content", { length: 256 }).notNull(),
});
