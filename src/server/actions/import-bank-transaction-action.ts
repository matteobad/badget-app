"use server";

import { revalidateTag } from "next/cache";

import { authActionClient } from "~/lib/safe-action";
import { importBankTransactionSchema } from "~/lib/validators";
import { upsertTransactions } from "../db/mutations";
import { transformTransaction } from "../providers/gocardless/transform";
import { getTransactions } from "./institutions/get-transactions";

export const importBankTransactionAction = authActionClient
  .schema(importBankTransactionSchema)
  .metadata({ actionName: "importBankTransactionSchema" })
  .action(
    async ({ parsedInput: { bankAccountIds, latest }, ctx: { userId } }) => {
      for (const bankAccountId of bankAccountIds) {
        const transactions = await getTransactions({
          bankAccountId,
          latest,
        });

        if (transactions.length === 0) continue;

        await upsertTransactions(
          transactions.map(transformTransaction).map((t) => ({
            ...t,
            userId,
            accountId: bankAccountId,
          })),
        );
      }

      revalidateTag(`bank_connections_${userId}`);
    },
  );
