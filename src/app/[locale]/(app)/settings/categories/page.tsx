import type { SearchParams } from "nuqs/server";
import { auth } from "@clerk/nextjs/server";

import { QUERIES } from "~/server/db/queries";
import AddCategoryDrawerDialog from "./add-category";
import CategoryDataTable from "./category-table";
import EditCategoryDrawerDialog from "./edit-category";
import { categoriesSearchParamsCache } from "./search-params";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const {} = await categoriesSearchParamsCache.parse(searchParams);

  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const categories = await QUERIES.getCategoriesForUser(session.userId);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <CategoryDataTable categories={categories} />
      </div>

      <AddCategoryDrawerDialog categories={categories} />
      <EditCategoryDrawerDialog categories={categories} />
    </>
  );
}
