"use server";

import { revalidateTag } from "next/cache";

import { authActionClient } from "~/lib/safe-action";
import { importBankTransactionSchema } from "~/lib/validators";
import { db, schema } from "../db";
import { buildConflictUpdateColumns } from "../db/utils";
import { transformTransaction } from "../providers/gocardless/transform";
import { getTransactions } from "./institutions/get-transactions";

export const importBankTransactionAction = authActionClient
  .schema(importBankTransactionSchema)
  .action(
    async ({ parsedInput: { bankAccountIds, latest }, ctx: { userId } }) => {
      for (const bankAccountId of bankAccountIds) {
        const bankTransactions =
          (
            await getTransactions({
              bankAccountId,
              latest,
            })
          )
            ?.map(transformTransaction)
            .map((t) => {
              return {
                userId,
                accountId: bankAccountId,
                amount: t.amount.toFixed(2),
                balance: t.balance?.toFixed(2),
                category: t.category,
                currency: t.currency,
                currencyRate: t.currency_rate?.toFixed(),
                currencySource: t.currency_source,
                date: new Date(t.date),
                description: t.description,
                method: t.method,
                name: t.name,
                status: t.status,
                transactionId: t.id,
              } satisfies typeof schema.bankTransactions.$inferInsert;
            }) ?? [];

        console.log(bankTransactions[0]);

        await db
          .insert(schema.bankTransactions)
          .values(bankTransactions)
          .onConflictDoUpdate({
            target: schema.bankTransactions.transactionId,
            set: buildConflictUpdateColumns(schema.bankTransactions, [
              "amount",
              "currency",
              "date",
              "description",
            ]),
          });
      }

      revalidateTag(`bank_transactions_${userId}`);
    },
  );
