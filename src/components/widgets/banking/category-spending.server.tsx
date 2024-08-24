"use server";

import { format } from "date-fns";
import { TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getSpendingByCategory } from "~/server/db/queries/cached-queries";
import { CategorySpeningChart } from "./category-spending-chart";

export default async function CategorySpendingServer(params: {
  from: Date;
  to: Date;
}) {
  const spendings = await getSpendingByCategory(params);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actual vs Budget</CardTitle>
        <CardDescription>{format(params.from, "MMMM yyyy")}</CardDescription>
      </CardHeader>
      <CardContent>
        <CategorySpeningChart chartData={spendings} />
      </CardContent>
    </Card>
  );
}
