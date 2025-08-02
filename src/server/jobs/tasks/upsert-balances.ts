import type { DB_AccountBalanceInsertType } from "~/server/db/schema/accounts";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { db } from "~/server/db";
import {
  account_balance_table,
  account_table,
} from "~/server/db/schema/accounts";
import { buildConflictUpdateColumns } from "~/server/db/utils";
import {
  TRANSACTION_METHOD,
  TRANSACTION_STATUS,
} from "~/shared/constants/enum";
import { format, isBefore, parseISO, subDays } from "date-fns";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

const transactionSchema = z.object({
  rawId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  method: z.enum(TRANSACTION_METHOD),
  date: z.string(),
  name: z.string(),
  status: z.enum(TRANSACTION_STATUS).optional(),
  counterpartyName: z.string().nullable().optional(),
  currency: z.string(),
  amount: z.number(),
});

export const upsertBalances = schemaTask({
  id: "upsert-balances",
  maxDuration: 120,
  queue: {
    concurrencyLimit: 10,
  },
  schema: z.object({
    orgId: z.string(),
    accountId: z.uuid(),
    manualSync: z.boolean().optional(),
    transactions: z.array(transactionSchema),
  }),
  run: async ({ transactions, orgId, accountId }) => {
    try {
      const [account] = await db
        .select()
        .from(account_table)
        .where(eq(account_table.id, accountId));

      if (!account) {
        logger.info("No account found");
        return;
      }

      const allSnapshots: DB_AccountBalanceInsertType[] = [];

      const tx = transactions
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
        .reverse();
      const snapshotDate = parseISO(account.updatedAt ?? account.createdAt);
      const earliestTxDate =
        tx.length > 0 ? parseISO(tx[tx.length - 1]!.date) : snapshotDate;

      const balances: { date: string; balance: number }[] = [];

      let balance = account.balance;
      let day = snapshotDate;

      while (!isBefore(day, earliestTxDate)) {
        const dateStr = format(day, "yyyy-MM-dd");

        // Somma delle transazioni in quella data
        const txForDay = tx.filter((t) => t.date === dateStr);
        const delta = txForDay.reduce((sum, t) => sum - t.amount, 0); // sottrai perché andiamo a ritroso

        balances.push({ date: dateStr, balance });

        balance -= delta;
        day = subDays(day, 1);
      }

      allSnapshots.push(
        ...balances.map((b) => ({
          organizationId: orgId,
          accountId: account.id,
          date: b.date,
          balance: b.balance,
          currency: account.currency || "EUR",
        })),
      );

      // Batch insert nel DB
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
    } catch (error) {
      logger.error("Failed to upsert balances", { error });

      throw error;
    }
  },
});
