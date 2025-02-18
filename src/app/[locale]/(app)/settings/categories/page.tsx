import { auth } from "@clerk/nextjs/server";

import { QUERIES } from "~/server/db/queries";
import AddCategoryDrawerDialog from "./add-category";
import CategoryDataTable from "./category-table";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const categories = await QUERIES.getCategoriesForUser(session.userId);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <CategoryDataTable categories={categories} />
      </div>

      <AddCategoryDrawerDialog categories={categories} />
    </>
  );
}
