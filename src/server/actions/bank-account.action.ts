"use server";

import { revalidateTag } from "next/cache";

import { authActionClient } from "~/lib/safe-action";
import { createBankAccountSchema } from "~/lib/validators";
import { createBankAccount } from "../db/mutations";

export const createBankAccountAction = authActionClient
  .schema(createBankAccountSchema)
  .action(
    async ({ parsedInput: { name, balance, currency }, ctx: { userId } }) => {
      await createBankAccount({
        name,
        balance,
        currency,
        userId: userId,
      });

      revalidateTag(`bank_accounts_${userId}`);
    },
  );

// export const deleteBankAccountAction = authActionClient
//   .schema(deleteCategorySchema)
//   .action(async ({ parsedInput: { categoryId }, ctx: { userId } }) => {
//     await deleteCategory({
//       categoryId: Number(categoryId),
//     });

//     revalidateTag(`bank_categories_${userId}`);
//   });
