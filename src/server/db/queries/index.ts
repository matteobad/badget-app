"server-only";

import {
  and,
  arrayContains,
  asc,
  desc,
  eq,
  getTableColumns,
  isNull,
  or,
} from "drizzle-orm";

import type {
  DB_AttachmentInsertType,
  DB_TransactionInsertType,
} from "../schema/transactions";
import { type ToggleAccountType } from "~/lib/validators";
import { db } from "..";
import { account_table as accountSchema } from "../schema/accounts";
import { category_table as categorySchema } from "../schema/categories";
import {
  connection_table as connectionSchema,
  institution_table as institutionSchema,
} from "../schema/open-banking";
import {
  attachment_table as attachmentSchema,
  transaction_table as transactionSchema,
} from "../schema/transactions";

// Helper type for database client
type DBType = typeof db;
type TXType = Parameters<Parameters<DBType["transaction"]>[0]>[0];
type DBClient = DBType | TXType;

export const QUERIES = {
  // institutions
  getInstitutionsForCountry: function (
    countryCode: string,
    client: DBClient = db,
  ) {
    return client
      .select()
      .from(institutionSchema)
      .where(arrayContains(institutionSchema.countries, [countryCode]))
      .orderBy(desc(institutionSchema.popularity));
  },
  getInstitutionById: function (institutionId: string, client: DBClient = db) {
    return client
      .select()
      .from(institutionSchema)
      .where(eq(institutionSchema.id, institutionId));
  },

  getConnectionsforUser: function (userId: string, client: DBClient = db) {
    return client
      .select()
      .from(connectionSchema)
      .where(eq(connectionSchema.userId, userId));
  },
  getConnectionByKey: function (key: string, client: DBClient = db) {
    return client
      .select()
      .from(connectionSchema)
      .where(eq(connectionSchema.referenceId, key));
  },

  getAccountsForUser: function (userId: string, client: DBClient = db) {
    return client
      .select()
      .from(accountSchema)
      .where(eq(accountSchema.userId, userId))
      .orderBy(accountSchema.name);
  },
  getDisabledAccountsForUser: function (userId: string, client: DBClient = db) {
    return client
      .select({ rawId: accountSchema.rawId })
      .from(accountSchema)
      .where(
        and(eq(accountSchema.userId, userId), eq(accountSchema.enabled, false)),
      );
  },
  getAccountsWithConnectionsForUser: function (
    userId: string,
    client: DBClient = db,
  ) {
    return client.query.connection_table.findMany({
      with: {
        accounts: { orderBy: asc(accountSchema.createdAt) },
        institution: true,
      },
      where: eq(connectionSchema.userId, userId),
    });
  },

  getCategoriesForUser: function (userId: string, client: DBClient = db) {
    return client
      .select()
      .from(categorySchema)
      .where(
        or(eq(categorySchema.userId, userId), isNull(categorySchema.userId)),
      )
      .orderBy(categorySchema.name);
  },

  // transactions
  getTransactionForUser: function (userId: string, client: DBClient = db) {
    return client
      .select({
        ...getTableColumns(transactionSchema),
        account: accountSchema,
        category: categorySchema,
      })
      .from(transactionSchema)
      .innerJoin(
        accountSchema,
        eq(transactionSchema.accountId, accountSchema.id),
      )
      .leftJoin(
        categorySchema,
        eq(transactionSchema.categoryId, categorySchema.id),
      )
      .where(eq(transactionSchema.userId, userId))
      .orderBy(desc(transactionSchema.date));
  },
  getTransactionById: function (transactionId: string, client: DBClient = db) {
    return client
      .select()
      .from(transactionSchema)
      .where(eq(transactionSchema.id, transactionId));
  },
};

export const MUTATIONS = {
  createTransaction: function (
    data: DB_TransactionInsertType,
    client: DBClient = db,
  ) {
    return client
      .insert(transactionSchema)
      .values(data)
      .returning({ insertedId: transactionSchema.id });
  },
  deleteTransaction: function (id: string, client: DBClient = db) {
    return client.delete(transactionSchema).where(eq(transactionSchema.id, id));
  },

  createAttachment: function (
    attachment: DB_AttachmentInsertType,
    client: DBClient = db,
  ) {
    return client.insert(attachmentSchema).values(attachment).returning();
  },
  updateAttachment: function (
    attachment: Partial<DB_AttachmentInsertType>,
    client: DBClient = db,
  ) {
    return client
      .update(attachmentSchema)
      .set(attachment)
      .where(
        and(
          eq(attachmentSchema.id, attachment.id!),
          eq(attachmentSchema.userId, attachment.userId!),
        ),
      );
  },
  deleteAttachment: function (id: string, userId: string, client: DBType = db) {
    return client
      .delete(attachmentSchema)
      .where(
        and(eq(attachmentSchema.id, id), eq(attachmentSchema.userId, userId)),
      );
  },

  toggleAccount: function (params: ToggleAccountType, client: DBClient = db) {
    return client
      .update(accountSchema)
      .set({ enabled: params.enabled })
      .where(eq(accountSchema.id, params.id));
  },
};

// Helper function to run transactions
export async function withTransaction<T>(
  callback: (tx: TXType) => Promise<T>,
): Promise<T> {
  return db.transaction(callback);
}

export function createTransactionMutation(data: DB_TransactionInsertType) {
  return db.insert(transactionSchema).values(data);
}
