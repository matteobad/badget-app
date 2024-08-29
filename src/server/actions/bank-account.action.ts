"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { authActionClient } from "~/lib/safe-action";
import {
  createBankAccountSchema,
  toggleBankAccountSchema,
  updateBankAccountSchema,
} from "~/lib/validators";
import {
  createBankAccount,
  toggleBankAccount,
  updateBankAccount,
} from "../db/mutations";

export const createBankAccountAction = authActionClient
  .schema(createBankAccountSchema)
  .metadata({ actionName: "createBankAccountAction" })
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

export const updateBankAccountAction = authActionClient
  .schema(updateBankAccountSchema)
  .metadata({ actionName: "updateBankAccountAction" })
  .action(
    async ({
      parsedInput: { id, name, type, balance, currency },
      ctx: { userId },
    }) => {
      console.log(id, name, type, balance, currency);
      await updateBankAccount({
        id,
        name,
        type,
        balance,
        currency,
        userId: userId,
      });

      revalidateTag(`bank_accounts_${userId}`);
      redirect("/settings/accounts");
    },
  );

export const toggleBankAccountAction = authActionClient
  .schema(toggleBankAccountSchema)
  .metadata({ actionName: "toggleBankAccountSchema" })
  .action(async ({ parsedInput: { id, enabled }, ctx: { userId } }) => {
    await toggleBankAccount({
      id,
      enabled,
      userId: userId,
    });

    revalidateTag(`bank_accounts_${userId}`);
  });

// export const deleteBankAccountAction = authActionClient
//   .schema(deleteCategorySchema)
//   .action(async ({ parsedInput: { categoryId }, ctx: { userId } }) => {
//     await deleteCategory({
//       categoryId: Number(categoryId),
//     });

//     revalidateTag(`bank_categories_${userId}`);
//   });
