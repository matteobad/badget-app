import { isNotNull, or, relations } from "drizzle-orm";
import { check, integer, primaryKey, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { accounts } from "./accounts";
import { groups } from "./groups";
import { users } from "./users";

export const workspaceToAccounts = pgTable(
  "workspace_to_accounts",
  {
    userId: varchar({ length: 32 })
      .notNull()
      .references(() => users.userId),
    groupId: varchar({ length: 32 })
      .notNull()
      .references(() => groups.groupId),
    accountId: integer()
      .notNull()
      .references(() => accounts.id),

    ...timestamps,
  },
  (t) => [
    check("workspace_id_check", or(isNotNull(t.groupId), isNotNull(t.userId))!),
    primaryKey({ columns: [t.accountId, t.userId, t.groupId] }),
  ],
);

export const workspaceToAccountsRelations = relations(
  workspaceToAccounts,
  ({ one }) => ({
    user: one(users, {
      fields: [workspaceToAccounts.userId],
      references: [users.userId],
    }),
    group: one(groups, {
      fields: [workspaceToAccounts.groupId],
      references: [groups.groupId],
    }),
    account: one(accounts, {
      fields: [workspaceToAccounts.accountId],
      references: [accounts.id],
    }),
  }),
);

export type SelectWorkspaceToAccount = typeof workspaceToAccounts.$inferSelect;
export type InsertWorkspaceToAccount = typeof workspaceToAccounts.$inferInsert;
