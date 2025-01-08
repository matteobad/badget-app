"use server";

import { revalidateTag } from "next/cache";

import { authActionClient } from "~/lib/safe-action";
import { CreateTransactionFormSchema } from "~/lib/validators/transactions";
import { createTransactionMutation } from "~/server/db/mutations/transactions-mutation";

export const createTransactionAction = authActionClient
  .schema(CreateTransactionFormSchema)
  .metadata({ actionName: "create-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await createTransactionMutation(parsedInput);

    // Invalidate cache
    revalidateTag(`${ctx.userId}-transactions`);

    // Return success message
    return { message: "Transaction created" };
  });
