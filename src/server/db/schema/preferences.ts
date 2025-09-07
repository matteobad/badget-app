import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { organization } from "./auth";

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

export type DB_OrganizationPreferences =
  typeof organization_preferences_table.$inferSelect;
export type DB_OrganizationPreferencesInsert =
  typeof organization_preferences_table.$inferInsert;
