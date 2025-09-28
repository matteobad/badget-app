import { uniqueIndex } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { organization, user } from "./auth";

export const organization_preferences_table = pgTable(
  "organization_preferences_table",
  (d) => ({
    id: d.uuid("id").defaultRandom().primaryKey().notNull(),
    organizationId: d
      .uuid()
      .references(() => organization.id, { onDelete: "cascade" })
      .notNull()
      .unique(),

    baseCurrency: d.text().notNull().default("EUR"),
    timezone: d.text().notNull().default("Europe/Rome"),
    locale: d.text().notNull().default("it-IT"),
    weekStartDay: d.integer().notNull().default(1),

    // Hybrid extensible preferences storage
    data: d.jsonb().$type<Record<string, unknown>>().notNull(),

    ...timestamps,
  }),
);

export const user_preferences_table = pgTable(
  "user_preferences_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    userId: d
      .uuid()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    organizationId: d
      .uuid()
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    widgets: d.jsonb().notNull().default("[]"), // array ordinato di card [{id, settings}]
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  }),
  (table) => [
    // Un utente ha una sola configurazione dashboard per ogni org
    uniqueIndex("user_dashboard_preferences_user_id_organization_id_unqidx").on(
      table.userId,
      table.organizationId,
    ),
  ],
);

export type DB_OrganizationPreferences =
  typeof organization_preferences_table.$inferSelect;
export type DB_OrganizationPreferencesInsert =
  typeof organization_preferences_table.$inferInsert;
