import { relations } from "drizzle-orm";
import { primaryKey, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { groups } from "./groups";
import { users } from "./users";

export const usersToGroups = pgTable(
  "users_to_groups",
  {
    userId: varchar({ length: 32 })
      .notNull()
      .references(() => users.userId),
    groupId: varchar({ length: 32 })
      .notNull()
      .references(() => groups.groupId),

    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.userId, t.groupId] })],
);

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  group: one(groups, {
    fields: [usersToGroups.groupId],
    references: [groups.groupId],
  }),
  user: one(users, {
    fields: [usersToGroups.userId],
    references: [users.userId],
  }),
}));
