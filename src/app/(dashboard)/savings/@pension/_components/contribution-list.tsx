import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { isNotNull } from "drizzle-orm";
import { ExternalLink, TrendingUp } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { euroFormat } from "~/lib/utils";
import { db, schema } from "~/server/db";

function Loading() {
  return (
    <div className="my-6 flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded-full"></Skeleton>
      <div className="flex flex-1 flex-col gap-1">
        <Skeleton className="h-4 w-[150px] rounded"></Skeleton>
        <Skeleton className="h-3 w-[100px] rounded"></Skeleton>
      </div>
      <Skeleton className="h-5 w-[70px] rounded"></Skeleton>
    </div>
  );
}

async function CardContributionsServer() {
  const session = auth();
  const contributions = await db.query.pensionContributions.findMany({
    with: {
      pensionAccount: {
        columns: {},
        with: {
          pensionFund: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
    where: isNotNull(schema.pensionContributions.consolidatedAt),
  });

  console.log(contributions);

  return (
    <Card className="col-span-2 row-span-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Recent Contributions</CardTitle>
            <CardDescription>
              You made {contributions.length} contributions this year.
            </CardDescription>
          </div>
          <Button variant="secondary" size="sm">
            Add Contribution
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2 space-y-6">
          {contributions.slice(0, 6).map((contribution) => {
            return (
              <div className="flex items-center" key={contribution.id}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-2">
                  <p className="text-sm font-medium leading-none">
                    {contribution.pensionAccount.pensionFund.name}
                  </p>
                  <p className="flex gap-2 text-sm font-light text-muted-foreground">
                    <span>
                      {format(contribution.consolidatedAt!, "LLL, y ")}
                    </span>{" "}
                    -
                    <Badge
                      variant="outline"
                      className="font-light lowercase text-slate-500"
                    >
                      {contribution.contributor}
                    </Badge>
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  {euroFormat(contribution.amount ?? 0)}
                </div>
              </div>
            );
          })}
        </div>
        {contributions.length < 6 &&
          Array(contributions.length)
            .fill(0)
            .map((_, index) => {
              return <Loading key={index} />;
            })}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-end justify-between gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Total contribution this year{" "}
              {euroFormat(
                contributions.reduce((tot, { amount }) => {
                  return tot + parseFloat(amount ?? "0");
                }, 0),
              )}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              TODO bel messaggino
            </div>
          </div>
          <Link
            href="/savings/contributions"
            className="flex items-center gap-1 text-sm hover:underline"
          >
            see all
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export function CardContributions() {
  return (
    <Suspense fallback={<Loading />}>
      <CardContributionsServer />
    </Suspense>
  );
}
