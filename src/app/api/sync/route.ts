import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

import { env } from "~/env";
import { getBankAccountProvider } from "~/lib/providers";
import { db } from "~/server/db";
import { QUERIES } from "~/server/db/queries";
import { account_table } from "~/server/db/schema/accounts";
import { transaction_table } from "~/server/db/schema/transactions";

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
      const connections = await QUERIES.getConnectionsforUser(user.id);
      for (const connection of connections) {
        const provider = getBankAccountProvider(connection.provider);
        const accounts = await provider.getAccounts({
          id: connection.referenceId!,
        });

        await db.transaction(async (tx) => {
          for (const account of accounts) {
            const transactions = await provider.getTransactions({
              accountId: account.rawId!,
              latest: true,
            });

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

            await tx
              .insert(transaction_table)
              .values(
                transactions.map((transaction) => ({
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
