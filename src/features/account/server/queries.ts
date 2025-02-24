"server-only";

import { eq, getTableColumns, isNull, or } from "drizzle-orm";

import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { category_table } from "~/server/db/schema/categories";
import {
  connection_table,
  institution_table,
} from "~/server/db/schema/open-banking";

export const getAccountsForUser = (userId: string) => {
  return db
    .select({
      ...getTableColumns(account_table),
      connection: connection_table,
      institution: institution_table,
    })
    .from(account_table)
    .leftJoin(
      connection_table,
      eq(connection_table.id, account_table.connectionId),
    )
    .leftJoin(
      institution_table,
      eq(institution_table.id, account_table.institutionId),
    )
    .where(eq(account_table.userId, userId));
};

export const getCategoriesForUser_QUERY = (userId: string) => {
  return db
    .select()
    .from(category_table)
    .where(or(eq(category_table.userId, userId), isNull(category_table.userId)))
    .orderBy(category_table.name);
};
