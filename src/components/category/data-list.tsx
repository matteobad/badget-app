"use client";

import type { CategoryType } from "~/shared/constants/enum";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { CATEGORY_TYPE } from "~/shared/constants/enum";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { ArrowLeftRight, TrendingDown, TrendingUp } from "lucide-react";

import { DataTable } from "./table/data-table";
import { DataTableSkeleton } from "./table/data-table-skeleton";
import { NoCategories } from "./table/empty-states";

const categoryConfig = {
  [CATEGORY_TYPE.INCOME]: {
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    description: "Track your earnings and revenue streams",
  },
  [CATEGORY_TYPE.EXPENSE]: {
    icon: TrendingDown,
    color: "text-red-500",
    bgColor: "bg-red-50",
    description: "Monitor your spending and outgoing payments",
  },
  [CATEGORY_TYPE.TRANSFER]: {
    icon: ArrowLeftRight,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "Track money movement between accounts",
  },
};

export function DataList() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.category.get.queryOptions({}));

  if (!data) return;

  if (!data.length) {
    return (
      <div className="relative h-[calc(100vh-200px)] overflow-hidden">
        <NoCategories />
        <DataTableSkeleton isEmpty />
      </div>
    );
  }

  return (
    <div className="grid w-full gap-4">
      {Object.entries(categoryConfig).map(([type, config]) => {
        const Icon = config.icon;

        return (
          <div
            key={type}
            className={cn("overflow-hidden", {
              // "row-span-2": type === "expense",
            })}
          >
            <Card className="flex h-full flex-col rounded-none bg-background shadow-none dark:bg-secondary">
              <CardHeader className="p-5 py-4">
                {/* Date Group Header */}
                <CardTitle className="flex items-center gap-2 font-normal">
                  <div className={`p-2 ${config.bgColor}`}>
                    <Icon className={`size-4 ${config.color}`} />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-sm text-black uppercase group-hover:!text-primary dark:text-[#666666]">
                      {`${type} Categories`}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              {/* Transaction Rows */}
              <CardContent className="flex-1 p-1 pt-0">
                <DataTable type={type as CategoryType} />
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
