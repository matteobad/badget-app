import { relations } from "drizzle-orm";
import { serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";

import type { Provider } from "./enum";
import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { accounts } from "./accounts";
import { ConnectionStatus } from "./enum";
import { institutions } from "./institutions";

export const connections = pgTable(
  "connections",
  {
    id: serial().primaryKey(),

    // FK
    institutionId: varchar()
      .notNull()
      .references(() => institutions.id),
    userId: varchar({ length: 32 }).notNull(),

    referenceId: varchar(),
    name: varchar({ length: 128 }).notNull(),
    logoUrl: varchar({ length: 2048 }),
    provider: text().$type<Provider>().notNull(),
    expiresAt: timestamp({ withTimezone: true }),
    lastAccessed: timestamp({ withTimezone: true }),
    error: varchar({ length: 128 }),
    status: text().$type<ConnectionStatus>().default(ConnectionStatus.UNKNOWN),

    ...timestamps,
  },
  (t) => [unique().on(t.institutionId, t.userId)],
);

export const connectionsRelations = relations(connections, ({ many, one }) => ({
  bankAccount: many(accounts),
  institution: one(institutions, {
    fields: [connections.institutionId],
    references: [institutions.id],
  }),
}));

type SelectConnection = typeof connections.$inferSelect;
type InsertConnection = typeof connections.$inferInsert;
