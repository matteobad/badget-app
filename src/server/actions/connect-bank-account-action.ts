"use server";

import { revalidateTag } from "next/cache";

import { authActionClient } from "~/lib/safe-action";
import { connectBankAccountSchema } from "~/lib/validators";
import { createBankAccounts } from "../db/mutations";

export const connectBankAccountAction = authActionClient
  .schema(connectBankAccountSchema)
  .action(
    async ({
      parsedInput: { provider, accounts, referenceId },
      ctx: { userId },
    }) => {
      await createBankAccounts({
        referenceId,
        userId: userId,
        accounts,
        provider,
      });

      revalidateTag(`bank_accounts_${userId}`);
      revalidateTag(`bank_accounts_currencies_${userId}`);
      revalidateTag(`bank_connections_${userId}`);
    },
  );
