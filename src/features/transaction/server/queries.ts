"server-only";

import { desc, eq, getTableColumns } from "drizzle-orm";

import { db } from "~/server/db";
import { account_table as accountTable } from "~/server/db/schema/accounts";
import { category_table as categoryTable } from "~/server/db/schema/categories";
import {
  tag_table as tagTable,
  transaction_table as transactionTable,
  transaction_to_tag_table as transactionToTagTable,
} from "~/server/db/schema/transactions";
import { type DBClient } from "~/server/db/utils";

export const QUERIES = {
  getTransactionForUser: function (userId: string, client: DBClient = db) {
    return client
      .select({
        ...getTableColumns(transactionTable),
        account: accountTable,
        category: categoryTable,
        tags: tagTable,
      })
      .from(transactionTable)
      .innerJoin(accountTable, eq(transactionTable.accountId, accountTable.id))
      .leftJoin(
        categoryTable,
        eq(transactionTable.categoryId, categoryTable.id),
      )
      .leftJoin(
        transactionToTagTable,
        eq(transactionTable.id, transactionToTagTable.transactionId),
      ) // Join transaction_tags
      .leftJoin(tagTable, eq(transactionToTagTable.tagId, tagTable.id)) // Join with tags
      .where(eq(transactionTable.userId, userId))
      .orderBy(desc(transactionTable.date), desc(transactionTable.createdAt));
  },

  getTransactionById: function (transactionId: string, client: DBClient = db) {
    return client
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.id, transactionId));
  },
};
