import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNotNull, sum } from "drizzle-orm";
import { EuroIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { euroFormat } from "~/lib/utils";
import { db, schema } from "~/server/db";

function Loading() {
  return <Skeleton className="h-9 w-[200px] rounded-none"></Skeleton>;
}

async function CardTotalServer() {
  const session = auth();
  const totalPension = await unstable_cache(
    async (userId: string) => {
      const totalContributions = await db
        .select({
          value: sum(schema.pensionContributions.amount),
        })
        .from(schema.pensionContributions)
        .where(
          and(
            eq(schema.pensionAccounts.userId, userId),
            isNotNull(schema.pensionContributions.consolidatedAt),
          ),
        )
        .leftJoin(
          schema.pensionAccounts,
          eq(
            schema.pensionContributions.pensionAccountId,
            schema.pensionAccounts.id,
          ),
        );

      return totalContributions[0]?.value ?? 0;
    },
    [""], // TODO: cache keys
  )(session.userId!);

  console.log(totalPension);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium capitalize">
          Total Principal
        </CardTitle>
        <EuroIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {euroFormat(totalPension, { maximumFractionDigits: 0 })}
        </div>
        <p className="text-xs text-muted-foreground">TODO subtitle</p>
      </CardContent>
    </Card>
  );
}

export function CardTotal() {
  return (
    <Suspense fallback={<Loading />}>
      <CardTotalServer />
    </Suspense>
  );
}
