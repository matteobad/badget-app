"server-only";

import { and, arrayContains, desc, eq, getTableColumns } from "drizzle-orm";

import type {
  DB_AttachmentInsertType,
  DB_TransactionInsertType,
} from "../schema/transactions";
import { db } from "..";
import { account_table as accountSchema } from "../schema/accounts";
import { category_table as categorySchema } from "../schema/categories";
import {
  connection_table as connectionSchema,
  institution_table as institutionSchema,
} from "../schema/open-banking";
import {
  transaction_attachment_table as attachmentSchema,
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

  getConnectionsForUser: function (userId: string, client: DBClient = db) {
    return client
      .select({
        ...getTableColumns(accountSchema),
        connection: connectionSchema,
        institution: institutionSchema,
      })
      .from(accountSchema)
      .leftJoin(
        institutionSchema,
        eq(accountSchema.institutionId, institutionSchema.id),
      )
      .leftJoin(
        connectionSchema,
        eq(accountSchema.connectionId, connectionSchema.id),
      )
      .where(eq(accountSchema.userId, userId));
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

  getCategoriesForUser: function (userId: string, client: DBClient = db) {
    return client
      .select()
      .from(categorySchema)
      .where(eq(categorySchema.userId, userId))
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
      .where(eq(transactionSchema.userId, userId));
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
