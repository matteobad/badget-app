import { relations } from "drizzle-orm";
import { text, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { usersToGroups } from "./users-to-groups";
import { workspaceToAccounts } from "./workspace-to-accounts";

export const users = pgTable("users", {
  userId: varchar({ length: 32 }).primaryKey(),
  email: text().unique(),

  ...timestamps,
});

export const usersRelations = relations(users, ({ many }) => ({
  usersToGroups: many(usersToGroups),
  workspaceToAccounts: many(workspaceToAccounts),
}));
