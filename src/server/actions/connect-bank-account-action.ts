"use server";

import { authActionClient } from "~/lib/safe-action";
import { upsertBankConnectionSchema } from "~/lib/validators";
import { upsertBankConnections } from "../db/mutations";

export const connectBankAccountAction = authActionClient
  .schema(upsertBankConnectionSchema)
  .metadata({ actionName: "upsertBankConnectionSchema" })
  .action(
    async ({ parsedInput: { accounts, connection }, ctx: { userId } }) => {
      await upsertBankConnections({
        connection: { ...connection, userId },
        accounts: accounts.map((account) => ({
          ...account,
          userId,
        })),
      });
    },
  );
