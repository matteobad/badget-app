"use server";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { euroFormat } from "~/lib/utils";
import { getSpendingByCategoryType } from "~/server/db/queries/cached-queries";
import { type CategoryType } from "~/server/db/schema/enum";

export default async function CategoryTypeSpendingServer(params: {
  from: Date;
  to: Date;
  type: CategoryType;
}) {
  const { actual, budget } = await getSpendingByCategoryType(params);
  const percentage =
    budget === 0 ? 0 : Math.ceil((Math.abs(actual) / budget) * 100);

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="pr-10 text-sm font-medium capitalize">
          {params.type.replace("_", " & ").toLowerCase()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{euroFormat(actual)}</div>
        <p className="text-xs text-muted-foreground">
          {euroFormat(budget)} budget
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-end">
        {/* <span className="text-xs font-light text-slate-500">{`${percentage}% del budget`}</span> */}
        <Progress
          max={100}
          value={percentage}
          aria-label={`${percentage}% del budget`}
        />
      </CardFooter>
    </Card>
  );
}
