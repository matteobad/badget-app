"server-only";

import {
  arrayContains,
  desc,
  eq,
  getTableColumns,
  isNull,
  or,
} from "drizzle-orm";

import { getBankAccountProvider } from "~/features/account/server/providers";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { category_table } from "~/server/db/schema/categories";
import {
  connection_table,
  institution_table,
} from "~/server/db/schema/open-banking";
import { transaction_table } from "~/server/db/schema/transactions";
import { buildConflictUpdateColumns } from "~/server/db/utils";
import { categorizeTransactions } from "~/utils/categorization";

// institutions
export const getInstitutionsForCountry = (countryCode: string) => {
  return db
    .select()
    .from(institution_table)
    .where(arrayContains(institution_table.countries, [countryCode]))
    .orderBy(desc(institution_table.popularity));
};

export const getInstitutionById = (institutionId: string) => {
  return db
    .select()
    .from(institution_table)
    .where(eq(institution_table.id, institutionId));
};

// connections
export const getConnectionsforUser = (userId: string) => {
  return db
    .select()
    .from(connection_table)
    .where(eq(connection_table.userId, userId));
};

export const getConnectionByKey = async (key: string) => {
  return db
    .select()
    .from(connection_table)
    .where(eq(connection_table.referenceId, key))
    .then((res) => res[0]);
};

export const syncUserConnection_MUTATION = async (
  userId: string,
  ref: string,
) => {
  const connection = await getConnectionByKey(ref);
  if (!connection) throw new Error("No connection found");

  const provider = getBankAccountProvider(connection.provider);
  if (!provider) throw new Error("Invalid provider");

  const accounts = await provider.getAccounts({ id: ref });
  // TODO: filter disabled accounts

  await db.transaction(async (tx) => {
    for (const { rawId, ...account } of accounts) {
      if (!rawId) return tx.rollback();
      const transactions = await provider.getTransactions({ accountId: rawId });

      // categorize transactions
      console.log("[syncUserConnection_MUTATION] categorizing");
      const txsData = await categorizeTransactions(userId, transactions);

      console.log("[syncUserConnection_MUTATION] upserting account");
      const upserted = await tx
        .insert(account_table)
        .values({
          ...{ ...account, rawId, userId },
          connectionId: connection.id,
          institutionId: connection.institutionId,
        })
        .onConflictDoUpdate({
          target: [account_table.userId, account_table.rawId],
          set: { ...account, rawId },
        })
        .returning({ id: account_table.id })
        .then((res) => res[0]);

      if (!upserted?.id) return tx.rollback();

      console.log("[syncUserConnection_MUTATION] upserting txs");
      await tx
        .insert(transaction_table)
        .values(
          // @ts-expect-error type is messeded up by categorizeTransactions
          txsData.map((t) => ({ ...t, accountId: upserted.id, userId })),
        )
        .onConflictDoUpdate({
          target: [transaction_table.userId, transaction_table.rawId],
          set: buildConflictUpdateColumns(transaction_table, [
            "amount",
            "description",
            "date",
            "currency",
          ]),
        });
    }
  });
};

// accounts
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

export const getAccounts_QUERY = (userId: string) => {
  return db
    .select({
      ...getTableColumns(account_table),
      institution: institution_table,
    })
    .from(account_table)
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
