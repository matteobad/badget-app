"use server";

import { revalidateTag } from "next/cache";

import { authActionClient } from "~/lib/safe-action";
import { updateBankTransactionSchema } from "~/lib/validators";
import {
  updateBankTransaction,
  updateCategoryRules,
  updateUncategorizedTransactions,
} from "../db/mutations";

export const updateBankTransactionAction = authActionClient
  .schema(updateBankTransactionSchema)
  .metadata({ actionName: "updateBankTransactionAction" })
  .action(
    async ({
      parsedInput: { id, categoryId, description },
      ctx: { userId },
    }) => {
      const edited = await updateBankTransaction({
        id,
        categoryId,
        description,
        userId,
      });

      // save information for logging purposes
      let updatedRules: Awaited<ReturnType<typeof updateCategoryRules>> = [];
      let updatedTransactions: Awaited<
        ReturnType<typeof updateUncategorizedTransactions>
      > = [];

      if (edited[0]?.description && categoryId) {
        // update category rule tokens
        updatedRules = await updateCategoryRules({
          categoryId,
          description: edited[0].description,
        });

        // update old uncategorized with same exact description
        updatedTransactions = await updateUncategorizedTransactions({
          categoryId,
          description: edited[0].description,
          userId,
        });
      }

      revalidateTag(`bank_transactions_${userId}`);
      revalidateTag(`category_rules_${userId}`);

      return {
        // inputs are already logged by action middleware
        updatedRules: updatedRules.length,
        updatedTransactions: updatedTransactions.length,
      };
    },
  );
