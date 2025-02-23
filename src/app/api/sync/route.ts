import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

import { env } from "~/env";
import { getBankAccountProvider } from "~/features/open-banking/server/providers";
import { getConnectionsforUser } from "~/features/open-banking/server/queries";
import { db } from "~/server/db";
import { QUERIES } from "~/server/db/queries";
import { account_table } from "~/server/db/schema/accounts";
import { transaction_table } from "~/server/db/schema/transactions";
import { categorizeTransactions } from "~/utils/categorization";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const client = await clerkClient();
    const userList = await client.users.getUserList();

    for (const user of userList.data) {
      const connections = await getConnectionsforUser(user.id);
      const disabledAccounts = await QUERIES.getDisabledAccountsForUser(
        user.id,
      );
      const disabledAccountIds = disabledAccounts.map((a) => a.rawId);

      // TODO: check validity, update status and filter expired connections

      for (const connection of connections) {
        const provider = getBankAccountProvider(connection.provider);
        const availableAccounts = await provider.getAccounts({
          id: connection.referenceId!,
        });

        const accounts = availableAccounts.filter((account) => {
          if (disabledAccountIds.includes(account.rawId)) return false;
          else return true;
        });

        await db.transaction(async (tx) => {
          for (const account of accounts) {
            const transactions = await provider.getTransactions({
              accountId: account.rawId!,
              latest: true,
            });
            const categorizedData = await categorizeTransactions(
              user.id,
              transactions,
            );

            const upserted = await tx
              .insert(account_table)
              .values({
                ...account,
                connectionId: connection.id,
                institutionId: connection.institutionId,
                userId: user.id,
              })
              .onConflictDoUpdate({
                target: [account_table.userId, account_table.rawId],
                set: {
                  ...account,
                  connectionId: connection.id,
                  institutionId: connection.institutionId,
                },
              })
              .returning({ insertedId: account_table.id });

            if (transactions.length === 0) continue;

            await tx
              .insert(transaction_table)
              .values(
                // @ts-expect-error type is messeded up by categorizeTransactions
                categorizedData.map((transaction) => ({
                  ...transaction,
                  accountId: upserted[0]!.insertedId,
                  userId: user.id,
                })),
              )
              .onConflictDoUpdate({
                target: [transaction_table.userId, transaction_table.rawId],
                set: {
                  ...transaction_table,
                  accountId: upserted[0]!.insertedId,
                },
              });
          }
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
