import type { SearchParams } from "nuqs/server";
import { auth } from "@clerk/nextjs/server";

import CategoryDataTable from "~/features/category/components/category-table";
import CreateCategoryDrawerSheet from "~/features/category/components/create-category-drawer-sheet";
import UpdateCategoryDrawerSheet from "~/features/category/components/update-category-drawer-sheet";
import { getCategoriesForUser_QUERY } from "~/features/category/server/queries";
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
  const categories = await getCategoriesForUser_QUERY(userId);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <CategoryDataTable categories={categories} />
      </div>

      <CreateCategoryDrawerSheet categories={categories} />
      <UpdateCategoryDrawerSheet categories={categories} />
    </>
  );
}
