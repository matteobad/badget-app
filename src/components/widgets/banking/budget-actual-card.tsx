"use client";

import type dynamicIconImports from "lucide-react/dynamicIconImports";

import Icon from "~/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { euroFormat } from "~/lib/utils";

type BudgetActualCardProps = {
  title: string;
  budget: number;
  actual: number;
  icon: keyof typeof dynamicIconImports;
};

export default function BudgetActualCard({
  title,
  budget,
  actual,
  icon,
}: BudgetActualCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium capitalize">
          {title}
        </CardTitle>
        <Icon name={icon} className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{euroFormat(actual)}</div>
        <p className="text-xs text-muted-foreground">
          {euroFormat(budget)} budget
        </p>
      </CardContent>
    </Card>
  );
}
