import type { NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

import { env } from "~/env";
import { getBankAccountProvider } from "~/lib/providers";
import { QUERIES } from "~/server/db/queries";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const client = await clerkClient();
  const userList = await client.users.getUserList();

  for (const user of userList.data) {
    const connections = await QUERIES.getConnectionsforUser(user.id);
    for (const connection of connections) {
      const provider = getBankAccountProvider(connection.id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const accounts = await provider.getAccounts({
        id: connection.referenceId!,
      });

      // TODO: upsert accounts and transactions
    }
  }

  return Response.json({ success: true });
}
