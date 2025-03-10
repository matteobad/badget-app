import type { SearchParams } from "nuqs/server";
import { auth } from "@clerk/nextjs/server";

import { CategoryTreeview } from "~/features/category/components/category-treeview";
import { getCategories_QUERY } from "~/features/category/server/queries";
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
  const promise = Promise.all([getCategories_QUERY(userId)]);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <CategoryTreeview promise={promise} />
        {/* <CategoryDataTable categories={categories} /> */}
      </div>

      {/* <CreateCategoryDrawerSheet categories={categories} />
      <UpdateCategoryDrawerSheet categories={categories} /> */}
    </>
  );
}
