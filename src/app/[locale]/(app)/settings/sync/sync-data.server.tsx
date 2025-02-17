import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Loader2Icon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { getBankAccountProvider } from "~/lib/providers";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { transaction_table } from "~/server/db/schema/transactions";

export default async function SyncDataServer(props: {
  id: string;
  provider: string;
  connectionId: string;
  institutionId: string;
}) {
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  const { id, connectionId, institutionId } = props;
  const provider = getBankAccountProvider(props.provider);
  const accounts = await provider.getAccounts({ id });
  const session = await auth();

  for (const account of accounts) {
    const transactions = await provider.getTransactions({
      accountId: account.rawId!,
    });

    const upserted = await db
      .insert(account_table)
      .values({
        ...account,
        connectionId: connectionId,
        institutionId: institutionId,
        userId: session.userId!,
      })
      .onConflictDoUpdate({
        target: [account_table.userId, account_table.rawId],
        set: {
          ...account,
          connectionId: connectionId,
          institutionId: institutionId,
        },
      })
      .returning({ insertedId: account_table.id });

    await db
      .insert(transaction_table)
      .values(
        transactions.map((transaction) => ({
          ...transaction,
          accountId: upserted[0]!.insertedId,
          userId: session.userId!,
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

  return (
    <Button asChild>
      <Link href="/banking/transactions">Vai alla dashboard</Link>
    </Button>
  );
}

export function SyncDataLoading() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2Icon className="size-4 animate-spin" />
      Sto sincronizzo i dati
    </div>
  );
}
