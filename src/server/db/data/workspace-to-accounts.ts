import { isNotNull, or, relations } from "drizzle-orm";
import { check, primaryKey, varchar } from "drizzle-orm/pg-core";

import { pgTable } from "../schema/_table";
import { account_table } from "../schema/accounts";
import { timestamps } from "../utils";
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
    accountId: varchar({ length: 128 })
      .notNull()
      .references(() => account_table.id),

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
    account: one(account_table, {
      fields: [workspaceToAccounts.accountId],
      references: [account_table.id],
    }),
  }),
);

export type SelectWorkspaceToAccount = typeof workspaceToAccounts.$inferSelect;
export type InsertWorkspaceToAccount = typeof workspaceToAccounts.$inferInsert;
