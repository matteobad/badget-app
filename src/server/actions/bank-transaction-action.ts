"use server";

import { authActionClient } from "~/lib/safe-action";
import { editBankTransactionSchema } from "~/lib/validators";
import { editBankTransaction } from "../db/mutations";

export const editBankTransactionAction = authActionClient
  .schema(editBankTransactionSchema)
  .action(
    async ({
      parsedInput: { id, categoryId, amount, description },
      ctx: { userId },
    }) => {
      await editBankTransaction({
        id,
        categoryId,
        amount,
        description,
        userId,
      });
    },
  );
