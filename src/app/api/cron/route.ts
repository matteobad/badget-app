import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq, gt, isNotNull, lt } from "drizzle-orm";

import { env } from "~/env";
import { getAccounts } from "~/server/actions/institutions/get-accounts";
import { getTransactions } from "~/server/actions/institutions/get-transactions";
import { db } from "~/server/db";
import {
  upsertBankConnections,
  upsertTransactions,
} from "~/server/db/mutations";
import { bankAccounts, bankConnections } from "~/server/db/schema/open-banking";
import {
  transformAccount,
  transformTransaction,
} from "~/server/providers/gocardless/transform";

export async function GET(_req: Request) {
  const headersList = headers();
  const authorization = headersList.get("Authorization");

  // if (authorization !== `Bearer ${env.CRON_SECRET}`) {
  //   return new NextResponse("Unauthorized", {
  //     status: 401,
  //   });
  // }

  // get all connections
  const connections = await db.query.bankConnections.findMany({
    where: and(
      isNotNull(bankConnections.referenceId),
      gt(bankConnections.expiresAt, new Date()),
    ),
    with: {
      bankAccount: {
        columns: { accountId: true },
        where: eq(bankAccounts.enabled, true),
      },
    },
  });

  for (const connection of connections) {
    const accounts = await getAccounts({ id: connection.referenceId! });

    // non-blocking
    void upsertBankConnections({
      ...connection,
      accounts: accounts.map(transformAccount).map((t) => ({
        ...t,
        userId: connection.userId,
        bankConnectionId: connection.id,
      })),
    });

    for (const account of accounts) {
      const transactions = await getTransactions({
        bankAccountId: account.id,
        latest: true,
      });

      // non-blocking
      void upsertTransactions(
        transactions.map(transformTransaction).map((t) => ({
          ...t,
          userId: connection.userId,
          accountId: account.id,
        })),
      );
    }

    // TODO: improve this to not revalidate same userId more than once
    revalidateTag(`bank_accounts_${connection.userId}`);
    revalidateTag(`bank_transations_${connection.userId}`);
  }

  return NextResponse.json({ ok: true });
}
