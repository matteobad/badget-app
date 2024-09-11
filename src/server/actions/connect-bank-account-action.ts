"use server";

import { revalidateTag } from "next/cache";
import { addDays } from "date-fns";

import { authActionClient } from "~/lib/safe-action";
import {
  connectAccountSchema,
  upsertBankConnectionBulkSchema,
} from "~/lib/validators";
import { upsertBankConnections, upsertTransactions } from "../db/mutations";
import { ConnectionStatus, Provider } from "../db/schema/enum";
import { type bankTransactions } from "../db/schema/open-banking";
import {
  transformAccount,
  transformTransaction,
} from "../providers/gocardless/transform";
import { getAccessValidForDays } from "../providers/gocardless/utils";
import { getAccounts } from "./institutions/get-accounts";
import { getTransactions } from "./institutions/get-transactions";

export const connectAccountAction = authActionClient
  .schema(connectAccountSchema)
  .metadata({ actionName: "connectAccountSchema" })
  .action(
    async ({
      parsedInput: { provider, reference, accountIds },
      ctx: { userId },
    }) => {
      const accounts = await getAccounts({ id: reference });

      if (!accounts[0]) {
        console.warn("There are no account for ref: ", reference);
        return;
      }

      // NOTE: GoCardLess connection expires after 90-180 days
      const expiresAt =
        provider === Provider.GOCARDLESS
          ? addDays(
              new Date(),
              getAccessValidForDays({
                institutionId: accounts[0].institution.id,
              }),
            )
          : undefined;

      const inserted = await upsertBankConnections({
        connection: {
          name: accounts[0].institution.name,
          institutionId: accounts[0].institution.id,
          logoUrl: accounts[0].institution.logo,
          status: ConnectionStatus.CONNECTED,
          expiresAt,
          referenceId: reference,
          provider,
          userId,
        },
        accounts: accounts.map((a) => ({ ...transformAccount(a), userId })),
      });

      const transactions: (typeof bankTransactions.$inferInsert)[] = [];
      for (const { id, accountId } of inserted) {
        if (accountId && accountIds.includes(accountId)) {
          const data = await getTransactions({
            bankAccountId: accountId,
            latest: false,
          });
          transactions.push(
            ...data.map((t) => ({
              ...transformTransaction(t),
              accountId: id,
              userId,
            })),
          );
        }
      }

      await upsertTransactions(transactions);

      revalidateTag(`bank_connections_${userId}`);
      revalidateTag(`bank_accounts_${userId}`);
      revalidateTag(`bank_transactions_${userId}`);
    },
  );

export const upsertBankConnectionBulkAction = authActionClient
  .schema(upsertBankConnectionBulkSchema)
  .metadata({ actionName: "upsert-bank-connection-bulk" })
  .action(async ({ parsedInput: { connections }, ctx: { userId } }) => {
    for (const { connection, accounts } of connections) {
      const inserted = await upsertBankConnections({
        connection,
        accounts,
      });

      const transactions: (typeof bankTransactions.$inferInsert)[] = [];

      for (const { id, accountId } of inserted) {
        if (!accountId) continue;

        const data = await getTransactions({
          bankAccountId: accountId,
          latest: false,
        });
        transactions.push(
          ...data.map((t) => ({
            ...transformTransaction(t),
            accountId: id,
            userId,
          })),
        );
      }

      await upsertTransactions(transactions);
    }

    // NOTE: GoCardLess connection expires after 90-180 days
    // const expiresAt =
    //   provider === Provider.GOCARDLESS
    //     ? addDays(
    //         new Date(),
    //         getAccessValidForDays({
    //           institutionId: accounts[0].institution.id,
    //         }),
    //       )
    //     : undefined;

    revalidateTag(`bank_connections_${userId}`);
    revalidateTag(`bank_accounts_${userId}`);
    revalidateTag(`bank_transactions_${userId}`);
  });
