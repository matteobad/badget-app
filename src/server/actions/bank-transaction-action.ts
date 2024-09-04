"use server";

import { revalidateTag } from "next/cache";
import { type z } from "zod";

import { authActionClient } from "~/lib/safe-action";
import {
  updateBankTransactionSchema,
  updateTransactionCategoryBulkSchema,
} from "~/lib/validators";
import {
  updateBankTransaction,
  updateCategoryRules,
  updateUncategorizedTransactions,
} from "../db/mutations";

const updateBankTransactionCategory = async (
  transaction: z.infer<typeof updateBankTransactionSchema>,
) => {
  const { id, categoryId, description, userId } = transaction;

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

  return {
    // inputs are already logged by action middleware
    updatedRules: updatedRules.length,
    updatedTransactions: updatedTransactions.length,
  };
};

export const updateBankTransactionAction = authActionClient
  .schema(updateBankTransactionSchema)
  .metadata({ actionName: "updateBankTransactionAction" })
  .action(async ({ parsedInput: transaction, ctx: { userId } }) => {
    const meta = await updateBankTransactionCategory(transaction);

    revalidateTag(`bank_transactions_${userId}`);
    revalidateTag(`category_rules_${userId}`);

    return meta;
  });

export const updateTransactionCategoryBulkAction = authActionClient
  .schema(updateTransactionCategoryBulkSchema)
  .metadata({ actionName: "updateTransactionCategoryBulkSchema" })
  .action(async ({ parsedInput: { transactions }, ctx: { userId } }) => {
    const meta = {
      updatedRules: 0,
      updatedTransactions: 0,
    };

    for (const transaction of transactions) {
      const { updatedRules, updatedTransactions } =
        await updateBankTransactionCategory(transaction);

      meta.updatedRules += updatedRules;
      meta.updatedTransactions += updatedTransactions;
    }

    revalidateTag(`bank_transactions_${userId}`);
    revalidateTag(`category_rules_${userId}`);

    return meta;
  });
