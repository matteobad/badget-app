"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { CategoryListEmpty } from "./category-list-empty";
import { CategoryTree } from "./category-tree";

type Category = RouterOutput["category"]["get"][number];

const groupCategoriesByTypeGroup = (categories: Category[]) => {
  const groups: Record<string, Category[]> = {};

  categories.forEach((category) => {
    // Use ACCOUNT_TYPE_GROUP to get the group key for the account type
    const groupKey = category.type;
    groups[groupKey] ??= [];
    groups[groupKey].push(category);
  });

  return groups;
};

export function DataTable() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.category.get.queryOptions({}));

  const groupedCategories = groupCategoriesByTypeGroup(data ?? []);

  if (!data || data?.length === 0) {
    return <CategoryListEmpty />;
  }

  return (
    <div className="w-full space-y-4">
      {/* Single Sticky Header */}
      <div className="sticky top-0 z-50 mb-4 flex items-center gap-4 rounded-lg bg-neutral-50 px-6 py-3 text-sm font-normal text-muted-foreground">
        <div className="min-w-[250px] text-left">CATEGORY</div>
        <div className="text-left uppercase">Description</div>
      </div>

      {/* Transaction Groups as Cards */}
      <div className="space-y-4">
        {Object.entries(groupedCategories).map(([type, typeAccounts]) => (
          <div key={type} className="overflow-hidden rounded-lg">
            <Card className="border-none bg-neutral-50 shadow-none">
              <CardHeader className="py-2 pt-4">
                {/* Date Group Header */}
                <CardTitle className="flex items-center gap-2 font-normal uppercase">
                  <span className="text-xs text-muted-foreground">
                    {`${type} Categories • ${typeAccounts.length - 1}`}
                  </span>
                </CardTitle>
              </CardHeader>
              {/* Transaction Rows */}
              <CardContent className="p-1">
                <div className="overflow-hidden rounded-lg border bg-background p-5 shadow">
                  <CategoryTree
                    items={data.filter((c) => c.type === type)}
                    rootId={
                      data.find((c) => c.type === type && !c.parentId)!.id
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
