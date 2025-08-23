import type { DB_AccountBalanceInsertType } from "~/server/db/schema/accounts";
import { logger, schemaTask } from "@trigger.dev/sdk";
import { db } from "~/server/db";
import {
  account_balance_table,
  account_table,
} from "~/server/db/schema/accounts";
import { transaction_table } from "~/server/db/schema/transactions";
import { buildConflictUpdateColumns } from "~/server/db/utils";
import { format, isBefore, parseISO, subDays } from "date-fns";
import { and, desc, eq, gt } from "drizzle-orm";
import { z } from "zod/v4";

// Types per migliorare la leggibilità
type BalanceSnapshot = {
  date: string;
  balance: number;
};

type BankAccount = NonNullable<Awaited<ReturnType<typeof getAccount>>>;
type Transaction = Awaited<ReturnType<typeof getTransactions>>[number];

/**
 * Job per aggiornare i saldi di un conto bancario
 *
 * Due modalità di funzionamento:
 * - manualSync = true: primo sync, backfill completo di tutti i saldi
 * - manualSync = false: sync giornaliero, aggiorna solo ultimi 5 giorni
 */
export const upsertBalances = schemaTask({
  id: "upsert-balances",
  maxDuration: 120,
  queue: {
    concurrencyLimit: 10,
  },
  schema: z.object({
    organizationId: z.string(),
    accountId: z.uuid(),
    manualSync: z.boolean().optional(),
  }),
  run: async ({ organizationId, accountId, manualSync }) => {
    try {
      const account = await getAccount(organizationId, accountId);

      if (!account) {
        logger.info("No account found");
        return;
      }

      const transactions = await getTransactions(
        organizationId,
        accountId,
        manualSync,
      );

      if (!transactions.length) {
        await handleNoTransactionsCase(account, manualSync);
        return;
      }

      await handleTransactionsCase(account, transactions);
    } catch (error) {
      logger.error("Failed to upsert balances", { error });
      throw error;
    }
  },
});

/**
 * Recupera l'account dal database
 */
async function getAccount(organizationId: string, accountId: string) {
  const [account] = await db
    .select()
    .from(account_table)
    .where(
      and(
        eq(account_table.id, accountId),
        eq(account_table.organizationId, organizationId),
      ),
    );

  return account;
}

/**
 * Recupera le transazioni per il periodo specificato
 */
async function getTransactions(
  organizationId: string,
  accountId: string,
  manualSync?: boolean,
) {
  const baseConditions = and(
    eq(transaction_table.accountId, accountId),
    eq(transaction_table.organizationId, organizationId),
  );

  // Per manual sync prendi tutte le transazioni, per daily sync solo ultimi 5 giorni
  const dateFilter = !manualSync
    ? [gt(transaction_table.date, format(subDays(new Date(), 5), "yyyy-MM-dd"))]
    : [];

  return await db
    .select({
      amount: transaction_table.amount,
      date: transaction_table.date,
    })
    .from(transaction_table)
    .where(and(baseConditions, ...dateFilter))
    .orderBy(desc(transaction_table.date));
}

/**
 * Gestisce il caso in cui non ci sono transazioni
 * Crea saldi per tutti i giorni nel range specificato usando il saldo corrente
 */
async function handleNoTransactionsCase(
  account: BankAccount,
  manualSync?: boolean,
) {
  logger.info(
    "No transactions found, creating balance snapshots without transaction data",
  );

  const { startDate, endDate } = calculateDateRange(account, manualSync);
  const balances = createStaticBalances(startDate, endDate, account.balance);

  await insertBalances(account, balances);
}

/**
 * Gestisce il caso in cui ci sono transazioni
 * Calcola i saldi a ritroso partendo dal saldo corrente
 */
async function handleTransactionsCase(
  account: BankAccount,
  transactions: Transaction[],
) {
  const snapshotDate = parseISO(account.updatedAt ?? account.createdAt);
  const earliestTxDate = parseISO(transactions[transactions.length - 1]!.date);

  const balances = calculateBalancesFromTransactions(
    account.balance,
    snapshotDate,
    earliestTxDate,
    transactions,
  );

  await insertBalances(account, balances);
}

/**
 * Calcola il range di date per il quale creare i saldi
 */
function calculateDateRange(account: BankAccount, manualSync?: boolean) {
  const endDate = parseISO(account.updatedAt ?? account.createdAt);

  // FIXME: primo sync usa total_transaction_days
  const startDate = manualSync
    ? parseISO(account.createdAt) // Per primo sync, dalla data di creazione account
    : subDays(new Date(), 5); // Per sync giornaliero, ultimi 5 giorni

  return { startDate, endDate };
}

/**
 * Crea saldi statici per tutti i giorni nel range specificato
 * Ogni giorno ha lo stesso saldo (quello corrente dell'account)
 */
function createStaticBalances(
  startDate: Date,
  endDate: Date,
  balance: number,
): BalanceSnapshot[] {
  const balances: BalanceSnapshot[] = [];
  let day = endDate;

  while (!isBefore(day, startDate)) {
    balances.push({
      date: format(day, "yyyy-MM-dd"),
      balance,
    });
    day = subDays(day, 1);
  }

  return balances;
}

/**
 * Calcola i saldi a ritroso partendo dal saldo corrente
 * Per ogni giorno, sottrae le transazioni per calcolare il saldo del giorno precedente
 */
function calculateBalancesFromTransactions(
  currentBalance: number,
  snapshotDate: Date,
  earliestTxDate: Date,
  transactions: Transaction[],
): BalanceSnapshot[] {
  const balances: BalanceSnapshot[] = [];
  let balance = currentBalance;
  let day = snapshotDate;

  while (!isBefore(day, earliestTxDate)) {
    const dateStr = format(day, "yyyy-MM-dd");

    // Calcola la variazione del saldo per questo giorno
    const txForDay = transactions.filter(
      (t) => format(new Date(t.date), "yyyy-MM-dd") === dateStr,
    );
    const dailyDelta = txForDay.reduce((sum, t) => sum + t.amount, 0);

    balances.push({ date: dateStr, balance });

    // Calcola il saldo del giorno precedente
    balance -= dailyDelta;
    day = subDays(day, 1);
  }

  return balances;
}

/**
 * Inserisce i saldi nel database con gestione dei conflitti
 */
async function insertBalances(
  account: BankAccount,
  balances: BalanceSnapshot[],
) {
  const allSnapshots: DB_AccountBalanceInsertType[] = balances.map((b) => ({
    organizationId: account.organizationId,
    accountId: account.id,
    date: b.date,
    balance: b.balance,
    currency: account.currency ?? "EUR",
  }));

  await db
    .insert(account_balance_table)
    .values(allSnapshots)
    .onConflictDoUpdate({
      target: [account_balance_table.accountId, account_balance_table.date],
      set: buildConflictUpdateColumns(account_balance_table, [
        "balance",
        "currency",
      ]),
    });
}
