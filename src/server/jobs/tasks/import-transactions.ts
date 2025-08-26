import type { DB_AccountType } from "~/server/db/schema/accounts";
import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import type { NormalizedTx } from "~/server/domain/transaction/utils";
import { logger, schemaTask } from "@trigger.dev/sdk";
import { db } from "~/server/db";
import { account_table, import_table } from "~/server/db/schema/accounts";
import { transaction_table } from "~/server/db/schema/transactions";
import {
  normalizeDescription,
  validateTransaction,
} from "~/server/domain/transaction/utils";
import { max, min } from "date-fns";
import { and, eq, inArray } from "drizzle-orm";
import z from "zod/v4";

import type { CSVRowParsed } from "../utils/import-transactions";
import { parseCSV } from "../utils/import-transactions";
import { recalculateSnapshotsTask } from "./recalculate-snapshots";
import { upsertTransactions } from "./upsert-transactions";

/**
 * Deduplicate transactions against existing ones
 */
export async function deduplicateTransactions(
  transactions: CSVRowParsed[],
  accountId: string,
) {
  if (transactions.length === 0) {
    return { new: [], duplicates: [] };
  }

  // Get existing fingerprints
  const fingerprints = transactions.map((t) => t.fingerprint);
  const existingTransactions = await db
    .select({ fingerprint: transaction_table.fingerprint })
    .from(transaction_table)
    .where(
      and(
        eq(transaction_table.accountId, accountId),
        inArray(transaction_table.fingerprint, fingerprints),
      ),
    );

  const existingFingerprints = new Set(
    existingTransactions.map((t) => t.fingerprint),
  );

  const newTransactions: DB_TransactionInsertType[] = [];
  const duplicates: DB_TransactionInsertType[] = [];

  for (const transaction of transactions) {
    if (existingFingerprints.has(transaction.fingerprint)) {
      duplicates.push(transaction);
    } else {
      newTransactions.push(transaction);
    }
  }

  return { new: newTransactions, duplicates };
}

/**
 * Validate transactions against account rules
 */
export function validateTransactions(
  transactions: DB_TransactionInsertType[],
  account: DB_AccountType,
) {
  const valid: DB_TransactionInsertType[] = [];
  const rejected: Array<{
    transaction: DB_TransactionInsertType;
    reason: string;
  }> = [];

  for (const transaction of transactions) {
    const normalizedTx: NormalizedTx = {
      accountId: transaction.accountId,
      amount: transaction.amount,
      date: new Date(transaction.date),
      descriptionNormalized: normalizeDescription(transaction.description!),
    };

    const validation = validateTransaction(normalizedTx, account, true); // true = CSV import

    if (validation.valid) {
      valid.push(transaction);
    } else {
      rejected.push({
        transaction,
        reason: validation.reason ?? "Unknown validation error",
      });
    }
  }

  return { valid, rejected };
}

const importTransactionsTaskSchema = z.object({
  filePath: z.string(),
  organizationId: z.string(),
  fieldMapping: z.object({
    date: z.string({ message: "Missing date mapping" }),
    description: z.string({ message: "Missing description mapping" }),
    amount: z.string({ message: "Missing amount mapping" }),
    currency: z.string(),
  }),
  extraFields: z.object({ accountId: z.string() }),
  settings: z.object({ inverted: z.boolean() }),
});

export const importTransactionsTask = schemaTask({
  id: "import-transactions",
  schema: importTransactionsTaskSchema,
  maxDuration: 120,
  queue: {
    concurrencyLimit: 5,
  },
  run: async ({ filePath, organizationId, ...options }) => {
    // Step 1: Get CSV
    const url = new URL(filePath);
    const response = await fetch(url);
    const text = await response.text();

    // Step 2: Parse CSV
    const parsedTransactions = await parseCSV(text, options, organizationId);

    // Step 3: Deduplicate
    const { new: newTransactions, duplicates } = await deduplicateTransactions(
      parsedTransactions,
      options.extraFields.accountId,
    );

    // Step 4: Get account details
    const accountId = options.extraFields.accountId;
    const [accountData] = await db
      .select()
      .from(account_table)
      .where(eq(account_table.id, accountId))
      .limit(1);

    if (!accountData) {
      logger.error(`Account ${accountId} not found`);
      throw new Error(`Account ${accountId} not found`);
    }

    // Step 5: Validate
    const { valid, rejected } = validateTransactions(
      newTransactions,
      accountData,
    );

    // Step 6: Insert valid transactions
    await upsertTransactions.triggerAndWait({
      bankAccountId: accountData.id,
      transactions: valid,
      organizationId,
    });

    // Step 7: Calculate affected date range
    const dates = valid.map((t) => t.date);
    const minDate = min(dates);
    const maxDate = max(dates);

    // Step 8: Recalculate snapshots
    void recalculateSnapshotsTask.trigger({
      accountId: accountData.id,
      fromDate: minDate,
      organizationId,
    });

    // Step 9: Record import
    await db.insert(import_table).values({
      organizationId,
      accountId: accountData.id,
      fileName: filePath, // FIXME: file management feature
      rowsOk: valid.length,
      rowsDup: duplicates.length,
      rowsRej: rejected.length,
      dateMin: minDate.toISOString().split("T")[0]!,
      dateMax: maxDate.toISOString().split("T")[0]!,
    });

    return {
      new: valid.length,
      duplicates: duplicates.length,
      rejected: rejected.length,
      range: { min: minDate, max: maxDate },
    };
  },
});
