import { createHash } from "node:crypto";
import { endOfDay, isAfter, startOfDay } from "date-fns";
import type { DB_TransactionType } from "~/server/db/schema/transactions";
import type { TransactionSourceType } from "~/shared/constants/enum";
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
  // Manual accounts: forward accumulation from opening balance + offsets
  if (account.manual) {
    let balance = 0;

    if (account.openingBalance !== null) {
      balance += account.openingBalance;
    }

    const relevantTransactions = transactions.filter(
      (tx) => tx.status === "posted" && new Date(tx.date) <= date,
    );
    balance += relevantTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    const relevantOffsets = offsets.filter(
      (offset) => offset.effectiveDatetime <= date,
    );
    balance += relevantOffsets.reduce((sum, offset) => sum + offset.amount, 0);

    return balance;
  }

  // Connected accounts: reverse accumulation from current balance
  // Assume account.balance reflects up-to-today closing balance
  let balance = account.balance ?? 0;

  const futureTransactions = transactions.filter(
    (tx) => tx.status === "posted" && new Date(tx.date) > date,
  );

  // Remove the effect of future transactions to get historical balance
  balance -= futureTransactions.reduce((sum, tx) => sum + tx.amount, 0);

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

  // Compare at date granularity in the account timezone
  const txStartOfDay = toStartOfDayInTimezone(
    transactionDate,
    account.timezone,
  );
  const t0StartOfDay = toStartOfDayInTimezone(
    new Date(account.t0Datetime),
    account.timezone,
  );

  return txStartOfDay < t0StartOfDay;
}

type CanCreateTransactionParams = {
  date: string;
  source: TransactionSourceType;
  isManualAccount: boolean;
  accountCreationDate: string;
};

export function canCreateTransaction(params: CanCreateTransactionParams) {
  const { date, source, accountCreationDate, isManualAccount } = params;

  const transactionDate = new Date(date);
  const accountT0Date = new Date(accountCreationDate);

  if (
    !isManualAccount &&
    source !== "api" &&
    isAfter(transactionDate, accountT0Date)
  ) {
    throw new Error("Cannot create manual transaction in connected account");
  }
}
