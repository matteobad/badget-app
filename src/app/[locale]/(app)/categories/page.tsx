import type { SearchParams } from "nuqs/server";
import { auth } from "@clerk/nextjs/server";
import { ScaleIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { CategoryFilters } from "~/features/category/components/category-filters";
import { CategoryTreeview } from "~/features/category/components/category-treeview";
import { getCategoriesWithBudgets_CACHED } from "~/features/category/server/cached-queries";
import { categoriesSearchParamsCache } from "~/features/category/utils/search-params";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const {} = await categoriesSearchParamsCache.parse(searchParams);

  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const userId = session.userId;
  const promise = Promise.all([getCategoriesWithBudgets_CACHED(userId)]);

  return (
    <div className="flex flex-1 flex-col gap-2 p-4 pt-0">
      <Card>
        <CardHeader className="p-4">
          <CategoryFilters />
        </CardHeader>
        <CardContent className="border-y p-4">
          <CategoryTreeview promise={promise} />
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4">
          <Button size="sm" variant="outline">
            <ScaleIcon /> Ridistribuisci
          </Button>
          <div className="flex items-center text-muted-foreground">
            <span className="font-mono text-primary">250 €</span>
            <span className="w-[86px] text-right">rimanenti</span>
          </div>
        </CardFooter>
        {/* <CategoryDataTable categories={categories} /> */}
      </Card>

      {/* <CreateCategoryDrawerSheet categories={categories} />
      <UpdateCategoryDrawerSheet categories={categories} /> */}
    </div>
  );
}
