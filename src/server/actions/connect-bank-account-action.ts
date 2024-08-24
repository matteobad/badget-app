"use server";

import { authActionClient } from "~/lib/safe-action";
import { upsertBankConnectionsSchema } from "~/lib/validators";
import { upsertBankConnections } from "../db/mutations";

export const connectBankAccountAction = authActionClient
  .schema(upsertBankConnectionsSchema)
  .action(
    async ({ parsedInput: { accounts, ...connection }, ctx: { userId } }) => {
      // await createBankAccounts({
      //   referenceId,
      //   userId: userId,
      //   accounts,
      //   provider,
      // });

      await upsertBankConnections({
        ...connection,
        accounts: accounts.map((a) => ({ ...a, userId })),
        userId,
      });
    },
  );
