import { createHash } from "crypto";
import type { DB_TransactionType } from "~/server/db/schema/transactions";
import { endOfDay, startOfDay } from "date-fns";

import type { DB_AccountType } from "../../db/schema/accounts";

// Types for the robust transaction system
export interface NormalizedTx {
  accountId: string;
  amount: number;
  date: Date;
  descriptionNormalized: string;
}

/**
 * Calculate fingerprint for transaction deduplication
 * Hash of {accountId, amount, date, counterparty, descriptionNormalized}
 */
export function calculateFingerprint(tx: NormalizedTx) {
  const data = {
    accountId: tx.accountId,
    amount: tx.amount,
    date: tx.date.toISOString().split("T")[0], // Date only
    descriptionNormalized: tx.descriptionNormalized.toLowerCase().trim(),
  };

  const hash = createHash("sha256");
  hash.update(JSON.stringify(data, Object.keys(data).sort()));
  return hash.digest("hex");
}

/**
 * Normalize description for fingerprint calculation
 */
export function normalizeDescription(description: string) {
  return description
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/[^\w\s]/g, ""); // Remove special characters
}

/**
 * Apply offset for manual accounts when transactions are added before t0
 * Creates or updates an offset transaction at t0 to maintain balance consistency
 */
export function applyOffset(
  accountId: string,
  t0: Date,
  openingBalance: number,
  transactionsBeforeT0: Array<{ amount: number; date: Date }>,
) {
  // Calculate the sum of all transactions before t0
  const sumBeforeT0 = transactionsBeforeT0.reduce(
    (sum, tx) => sum + tx.amount,
    0,
  );

  // The offset should make the balance at t0 equal to opening_balance
  // Balance(t0) = opening_balance + sum_before_t0 + offset
  // Therefore: offset = opening_balance - sum_before_t0
  const offsetAmount = openingBalance - sumBeforeT0;

  return {
    id: crypto.randomUUID(),
    accountId: accountId,
    effectiveDatetime: t0,
    amount: offsetAmount,
  };
}

/**
 * Get the minimum affected date when transactions are modified
 * Used to determine the starting point for snapshot recalculation
 */
export function getMinAffectedDate(
  transactions: Array<{ date: Date; booking_date: Date }>,
  existingMinDate?: Date,
) {
  const dates = transactions.map((tx) =>
    tx.booking_date < tx.date ? tx.booking_date : tx.date,
  );

  if (existingMinDate) {
    dates.push(existingMinDate);
  }

  return new Date(Math.min(...dates.map((d) => d.getTime())));
}

/**
 * Convert date to end-of-day in account timezone
 */
export function toEndOfDayInTimezone(date: Date, _timezone: string): Date {
  const endOfDayLocal = endOfDay(date);
  return endOfDayLocal;
  // return zonedTimeToUtc(endOfDayLocal, timezone);
}

/**
 * Convert date to start-of-day in account timezone
 */
export function toStartOfDayInTimezone(date: Date, _timezone: string): Date {
  const startOfDayLocal = startOfDay(date);
  return startOfDayLocal;
  // return zonedTimeToUtc(startOfDayLocal, timezone);
}

/**
 * Calculate daily balance from transactions and offsets
 */
export function calculateDailyBalance(
  date: Date,
  account: DB_AccountType,
  transactions: DB_TransactionType[],
  offsets: Array<{ effectiveDatetime: Date; amount: number }>,
) {
  let balance = 0;

  // Add opening balance for manual accounts
  if (account.manual && account.openingBalance !== null) {
    balance += account.openingBalance;
  }

  // Add balance for connected accounts
  if (!account.manual && account.balance !== null) {
    balance += account.balance;
  }

  // Add all posted transactions up to this date
  const relevantTransactions = transactions.filter(
    (tx) => tx.status === "posted" && new Date(tx.date) >= date,
  );

  balance += relevantTransactions.reduce((sum, tx) => sum - tx.amount, 0);

  // Add all offsets effective up to this date
  const relevantOffsets = offsets.filter(
    (offset) => offset.effectiveDatetime <= date,
  );

  balance += relevantOffsets.reduce((sum, offset) => sum + offset.amount, 0);

  return balance;
}

/**
 * Validate transaction against account rules
 */
export function validateTransaction(
  transaction: NormalizedTx,
  account: DB_AccountType,
  isCsvImport = false,
) {
  // Connected accounts: no manual transactions allowed
  if (!account.manual && !isCsvImport) {
    return {
      valid: false,
      reason: "Manual transactions not allowed for connected accounts",
    };
  }

  // Connected accounts: CSV import only before authoritative_from
  if (!account.manual && isCsvImport && account.authoritativeFrom) {
    if (transaction.date >= new Date(account.authoritativeFrom)) {
      return {
        valid: false,
        reason: `CSV import not allowed after ${new Date(account.authoritativeFrom).toISOString()}`,
      };
    }
  }

  // Manual accounts: validate t0_datetime is set
  if (account.manual && !account.t0Datetime) {
    return { valid: false, reason: "Manual account must have t0_datetime set" };
  }

  return { valid: true };
}

/**
 * Check if a transaction should trigger offset adjustment
 */
export function shouldAdjustOffset(
  transactionDate: Date,
  account: DB_AccountType,
) {
  if (!account.manual || !account.t0Datetime) {
    return false;
  }

  return transactionDate < new Date(account.t0Datetime);
}

/**
 * Generate unique transfer ID for double-entry transactions
 */
export function generateTransferId() {
  return crypto.randomUUID();
}

/**
 * Check if transaction is a transfer (has transfer_id)
 */
export function isTransfer(transaction: DB_TransactionType) {
  return transaction.transferId !== null;
}

/**
 * Get all transactions in a transfer
 */
export function getTransferTransactions(
  transferId: string,
  transactions: DB_TransactionType[],
) {
  return transactions.filter((tx) => tx.transferId === transferId);
}

/**
 * Validate transfer balance (should sum to zero)
 */
export function validateTransferBalance(
  transferTransactions: DB_TransactionType[],
) {
  const total = transferTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  return { valid: Math.abs(total) < 0.01, total };
}
