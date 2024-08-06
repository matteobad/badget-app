import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { EuroIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { euroFormat } from "~/lib/utils";

function Loading() {
  return <Skeleton className="h-9 w-[200px] rounded-none"></Skeleton>;
}

async function CardReturnServer() {
  const session = auth();
  const totalReturn = await unstable_cache(
    async (_userId: string) => {
      return 100;
    },
    [""], // TODO: cache keys
  )(session.userId!);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium capitalize">
          Performance
        </CardTitle>
        <EuroIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {euroFormat(totalReturn, {
            maximumFractionDigits: 0,
            signDisplay: "exceptZero",
          })}
        </div>
        <p className="text-xs text-muted-foreground">TODO subtitle</p>
      </CardContent>
    </Card>
  );
}

export function CardReturn() {
  return (
    <Suspense fallback={<Loading />}>
      <CardReturnServer />
    </Suspense>
  );
}
