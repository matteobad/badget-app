import { relations } from "drizzle-orm";
import { text, varchar } from "drizzle-orm/pg-core";

import { pgTable } from "../schema/_table";
import { timestamps } from "../utils";
import { usersToGroups } from "./users-to-groups";
import { workspaceToAccounts } from "./workspace-to-accounts";

export const groups = pgTable("groups", {
  groupId: varchar({ length: 32 }).primaryKey(),
  name: text(),

  ...timestamps,
});

export const groupsRelations = relations(groups, ({ many }) => ({
  usersToGroups: many(usersToGroups),
  workspaceToAccounts: many(workspaceToAccounts),
}));
