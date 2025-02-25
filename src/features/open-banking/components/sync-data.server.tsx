import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Loader2Icon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { getBankAccountProvider } from "~/features/open-banking/server/providers";
import { withTransaction } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { transaction_table } from "~/server/db/schema/transactions";
import { buildConflictUpdateColumns } from "~/server/db/utils";
import { categorizeTransactions } from "~/utils/categorization";

export default async function SyncDataServer(props: {
  id: string;
  provider: string;
  connectionId: string;
  institutionId: string;
}) {
  const { id, connectionId, institutionId } = props;
  const provider = getBankAccountProvider(props.provider);
  const accounts = await provider.getAccounts({ id });
  const session = await auth();

  await withTransaction(async (tx) => {
    for (const account of accounts) {
      const transactions = await provider.getTransactions({
        accountId: account.rawId!,
      });
      const categorizedData = await categorizeTransactions(
        session.userId!,
        transactions,
      );

      const upserted = await tx
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
        .returning({ id: account_table.id });

      if (!upserted[0]?.id) return tx.rollback();

      await tx
        .insert(transaction_table)
        .values(
          // @ts-expect-error type is messeded up by categorizeTransactions
          categorizedData.map((transaction) => ({
            ...transaction,
            accountId: upserted[0]!.id,
            userId: session.userId!,
          })),
        )
        .onConflictDoUpdate({
          target: [transaction_table.userId, transaction_table.rawId],
          set: buildConflictUpdateColumns(transaction_table, [
            "amount",
            "description",
            "date",
            "currency",
          ]),
        });

      // revalidateTag(`transaction_${session.userId}`);
    }
  });

  return (
    <Button asChild>
      <Link href="/transactions">Vai alla dashboard</Link>
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
