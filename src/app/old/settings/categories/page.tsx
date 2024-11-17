import { Suspense } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

import { ErrorFallback } from "~/components/error-fallback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AddCategoryButton } from "./_components/add-category-button";
import { CategoryListLoading } from "./_components/category-list.loading";
import { CategoryListServer } from "./_components/category-list.server";

export default function CategoriesPage() {
  return (
    <Card className="h-fit w-full max-w-screen-sm">
      <CardHeader className="flex flex-row justify-between gap-6">
        <div className="flex flex-col space-y-1.5">
          <CardTitle>Categorie</CardTitle>
          <CardDescription>
            Manage spending categories, edit or create new ones.
          </CardDescription>
        </div>
        <AddCategoryButton />
      </CardHeader>
      <CardContent className="space-y-2">
        <ErrorBoundary errorComponent={ErrorFallback}>
          <Suspense fallback={<CategoryListLoading />}>
            <CategoryListServer />
          </Suspense>
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
}
