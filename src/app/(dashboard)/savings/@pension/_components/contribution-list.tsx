"use client";

import { use } from "react";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type PensionFunsContributions } from "~/lib/data";
import { euroFormat } from "~/lib/utils";
import { type DashboardFacets } from "../page";

export function ContributionList(props: {
  facets: DashboardFacets;
  promise: PensionFunsContributions;
}) {
  const { from, to } = props.facets.timeframe;
  const fundWithContributions = use(props.promise);

  const contributions = fundWithContributions
    .map((fund) => fund.contributions)
    .flat();

  return (
    <Card className="col-span-2 row-span-2">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg">Recent Contributions</CardTitle>
          <CardDescription>
            You made {contributions.length} contributions this year.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {fundWithContributions.map((fund) => {
            return fund.contributions.map((contribution) => {
              return (
                <div className="flex items-center" key={contribution.id}>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback>OM</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {contribution.contributor}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(contribution.consolidated_at!, "LLL, y")}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {euroFormat(contribution.amount!)}
                  </div>
                </div>
              );
            });
          })}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
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
              {format(from, "LLL y") + " - " + format(to, "LLL y")}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
