"use server";

import { revalidateTag } from "next/cache";

import { authActionClient } from "~/lib/safe-action";
import { editBankTransactionSchema } from "~/lib/validators";
import { editBankTransaction } from "../db/mutations";

export const editBankTransactionAction = authActionClient
  .schema(editBankTransactionSchema)
  .action(
    async ({
      parsedInput: { categoryId, amount, description },
      ctx: { userId },
    }) => {
      await editBankTransaction({
        categoryId,
        amount,
        description,
      });

      revalidateTag(`bank_transactions_${userId}`);
    },
  );
