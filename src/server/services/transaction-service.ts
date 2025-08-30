import type {
  categorizeTransactionSchema,
  createManualTransactionSchema,
  createTransactionSchema,
  createTransferSchema,
  deleteManyTransactionsSchema,
  deleteTranferSchema,
  deleteTransactionSchema,
  getTransactionsSchema,
  updateTransactionSchema,
  updateTransactionsSchema,
} from "~/shared/validators/transaction.schema";
import type z from "zod/v4";
import { updateOrCreateRule } from "~/utils/categorization";
import { eq } from "drizzle-orm";

import type { DBClient } from "../db";
import type { NormalizedTx } from "../domain/transaction/utils";
import { db, withTransaction } from "../db";
import { account_table } from "../db/schema/accounts";
import { transaction_table } from "../db/schema/transactions";
import { updateAttachmentMutation } from "../domain/attachment/mutations";
import {
  createTransactionMutation,
  deleteManyTransactionsMutation,
  updateManyTransactionsMutation,
  updateTransactionMutation,
  updateTransactionTagsMutation,
} from "../domain/transaction/mutations";
import {
  getTransactionAccountCountsQuery,
  getTransactionAmountRangeQuery,
  getTransactionByIdQuery,
  getTransactionCategoryCountsQuery,
  getTransactionsQuery,
  getTransactionTagCountsQuery,
} from "../domain/transaction/queries";
import {
  calculateFingerprint,
  generateTransferId,
  normalizeDescription,
  validateTransferBalance,
} from "../domain/transaction/utils";
import {
  adjustBalanceOffsets,
  recalculateSnapshots,
  updateAccountBalance,
} from "./balance-snapshots-service";

export async function getTransactions(
  filters: z.infer<typeof getTransactionsSchema>,
  orgId: string,
) {
  return await getTransactionsQuery(filters, orgId);
}

export async function getTransactionById(id: string, orgId: string) {
  return await getTransactionByIdQuery(id, orgId);
}

export async function getTransactionAmountRange(orgId: string) {
  return await getTransactionAmountRangeQuery(orgId);
}

export async function getTransactionCategoryCounts(orgId: string) {
  return await getTransactionCategoryCountsQuery(orgId);
}

export async function getTransactionTagsCounts(orgId: string) {
  return await getTransactionTagCountsQuery(orgId);
}

export async function getTransactionAccountCounts(orgId: string) {
  return await getTransactionAccountCountsQuery(orgId);
}

export async function createTransaction(
  input: z.infer<typeof createTransactionSchema>,
  orgId: string,
) {
  await withTransaction(async (tx) => {
    // insert transaction
    const inserted = await createTransactionMutation(tx, input, orgId);

    if (!inserted[0]?.id) return tx.rollback();
    const transactionId = inserted[0].id;

    // update transaction attachments
    for (const id of input?.attachment_ids ?? []) {
      const updatedAttachment = { id, orgId, transactionId };
      await updateAttachmentMutation(tx, updatedAttachment, orgId);
    }

    // update transaction tags
    const tags = input?.tags?.map((t) => t.text) ?? [];
    await updateTransactionTagsMutation(tx, { tags, transactionId }, orgId);
  });

  // update category rule relevance
  await updateOrCreateRule(orgId, input.name, input.categoryId);
}

/**
 * Create a manual transaction
 */
export async function createManualTransaction(
  client: DBClient,
  input: z.infer<typeof createManualTransactionSchema>,
  organizationId: string,
) {
  return client.transaction(async (tx) => {
    // Get account details
    const [account] = await tx
      .select()
      .from(account_table)
      .where(eq(account_table.id, input.accountId))
      .limit(1);

    if (!account) {
      throw new Error(`Account ${input.accountId} not found`);
    }

    // Validate account allows manual transactions
    if (!account.manual) {
      throw new Error("Manual transactions not allowed for connected accounts");
    }

    // Create normalized transaction for fingerprint calculation
    const date = new Date(input.date);
    const normalizedTx: NormalizedTx = {
      accountId: input.accountId,
      amount: input.amount,
      date: new Date(input.date),
      descriptionNormalized: normalizeDescription(input.name),
    };

    const fingerprint = calculateFingerprint(normalizedTx);

    // Check for duplicates
    const existing = await tx
      .select({ id: transaction_table.id })
      .from(transaction_table)
      .where(eq(transaction_table.fingerprint, fingerprint))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Transaction with this fingerprint already exists");
    }

    // Insert the transaction
    const [transaction] = await tx
      .insert(transaction_table)
      .values({
        organizationId,
        accountId: input.accountId,
        amount: input.amount,
        currency: account.currency,
        date: input.date,
        name: input.name,
        description: input.description,
        method: input.method ?? "other",
        status: input.status ?? "posted",
        source: input.source ?? "manual",
        transferId: input.transferId,
        categoryId: input.categoryId,
        note: input.note,
        fingerprint,
      })
      .returning({ id: transaction_table.id });

    // Check if offset adjustment is needed
    await adjustBalanceOffsets(
      tx,
      { accountId: input.accountId, fromDate: date },
      organizationId,
    );

    // Recalculate snapshots from the affected date
    await recalculateSnapshots(
      tx,
      { accountId: input.accountId, fromDate: date },
      organizationId,
    );

    // Update account balance
    await updateAccountBalance(
      tx,
      { accountId: input.accountId },
      organizationId,
    );

    return { id: transaction!.id, fingerprint };
  });
}

/**
 * Create a transfer (double-entry transaction)
 */
export async function createTransfer(
  client: DBClient,
  input: z.infer<typeof createTransferSchema>,
  organizationId: string,
) {
  return client.transaction(async (tx) => {
    // Validate accounts exist and belong to organization
    const accounts = await tx
      .select()
      .from(account_table)
      .where(eq(account_table.organizationId, organizationId));

    const fromAccount = accounts.find((a) => a.id === input.fromAccountId);
    const toAccount = accounts.find((a) => a.id === input.toAccountId);

    if (!fromAccount || !toAccount) {
      throw new Error("One or both accounts not found");
    }

    // Generate transfer ID
    const transferId = generateTransferId();

    // Create outgoing transaction
    const fromTransaction = await createManualTransaction(
      tx,
      {
        accountId: input.fromAccountId,
        amount: -input.amount, // Negative for outgoing
        date: input.date,
        description: `Transfer to ${toAccount.name}: ${input.description}`,
        name: `Transfer to ${toAccount.name}: ${input.description}`,
        counterparty: toAccount.name,
        transferId: transferId,
        currency: "EUR",
      },
      organizationId,
    );

    // Create incoming transaction
    const toTransaction = await createManualTransaction(
      tx,
      {
        accountId: input.toAccountId,
        amount: input.amount, // Positive for incoming
        date: input.date,
        description: `Transfer from ${fromAccount.name}: ${input.description}`,
        name: `Transfer to ${toAccount.name}: ${input.description}`,
        counterparty: fromAccount.name,
        transferId: transferId,
        currency: "EUR",
      },
      organizationId,
    );

    return {
      fromTransactionId: fromTransaction.id,
      toTransactionId: toTransaction.id,
    };
  });
}

/**
 * Update a transaction
 */
export async function updateTransaction(
  client: DBClient,
  input: z.infer<typeof updateTransactionSchema>,
  organizationId: string,
) {
  return await updateTransactionMutation(client, { ...input, organizationId });
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(
  client: DBClient,
  input: z.infer<typeof deleteTransactionSchema>,
  organizationId: string,
) {
  return client.transaction(async (tx) => {
    // Get existing transaction
    const existing = await tx
      .select()
      .from(transaction_table)
      .where(eq(transaction_table.id, input.id))
      .limit(1);

    if (!existing[0]) {
      throw new Error(`Transaction ${input.id} not found`);
    }

    const existingTransaction = existing[0];

    // Validate organization ownership
    if (existingTransaction.organizationId !== organizationId) {
      throw new Error("Transaction not found");
    }

    // Check if it's part of a transfer
    if (existingTransaction.transferId) {
      const transferTransactions = await tx
        .select()
        .from(transaction_table)
        .where(
          eq(transaction_table.transferId, existingTransaction.transferId),
        );

      if (transferTransactions.length > 1) {
        throw new Error(
          "Cannot delete individual transaction from a transfer. Delete the entire transfer instead.",
        );
      }
    }

    // Delete the transaction
    await tx
      .delete(transaction_table)
      .where(eq(transaction_table.id, input.id));

    // Recalculate snapshots from the transaction date
    const affectedDate = new Date(existingTransaction.date);

    // TODO: if removing last first transaction we should 0-out
    // the spashots until the new first transactions
    await recalculateSnapshots(
      tx,
      { accountId: existingTransaction.accountId, fromDate: affectedDate },
      organizationId,
    );

    // Update account balance
    await updateAccountBalance(
      tx,
      { accountId: existingTransaction.accountId },
      organizationId,
    );
  });
}

/**
 * Delete an entire transfer
 */
export async function deleteTransfer(
  client: DBClient,
  input: z.infer<typeof deleteTranferSchema>,
  organizationId: string,
) {
  return client.transaction(async (tx) => {
    // Get all transactions in the transfer
    const transferTransactions = await tx
      .select()
      .from(transaction_table)
      .where(eq(transaction_table.transferId, input.id));

    if (!transferTransactions[0]) {
      throw new Error(`Transfer ${input.id} not found`);
    }

    // Validate organization ownership
    const firstTransaction = transferTransactions[0];
    if (firstTransaction.organizationId !== organizationId) {
      throw new Error("Transfer not found");
    }

    // Validate transfer balance
    const balanceValidation = validateTransferBalance(transferTransactions);
    if (!balanceValidation.valid) {
      console.warn(
        `Transfer ${input.id} has invalid balance: ${balanceValidation.total}`,
      );
    }

    // Get the earliest date for snapshot recalculation
    const dates = transferTransactions.map((t) => new Date(t.date));
    const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));

    // Delete all transactions in the transfer
    await tx
      .delete(transaction_table)
      .where(eq(transaction_table.transferId, input.id));

    // Recalculate snapshots for all affected accounts
    const accountIds = [
      ...new Set(transferTransactions.map((t) => t.accountId)),
    ];

    for (const accountId of accountIds) {
      const input = { accountId, fromDate: earliestDate };
      await recalculateSnapshots(tx, input, organizationId);
      await updateAccountBalance(tx, { accountId }, organizationId);
    }
  });
}

export async function updateManyTransactions(
  client: DBClient,
  input: z.infer<typeof updateTransactionsSchema>,
  organizationId: string,
) {
  return client.transaction(async (tx) => {
    return await updateManyTransactionsMutation(tx, {
      ...input,
      organizationId,
    });
  });
}

export async function deleteManyTransactions(
  input: z.infer<typeof deleteManyTransactionsSchema>,
  orgId: string,
) {
  return await deleteManyTransactionsMutation(db, {
    ...input,
    orgId,
  });
}

export async function categorizeTransaction(
  input: z.infer<typeof categorizeTransactionSchema>,
  orgId: string,
) {
  return await categorizeTransaction(input, orgId);
}
