import type { SearchParams } from "nuqs/server";
import { auth } from "@clerk/nextjs/server";

import { QUERIES } from "~/server/db/queries";
import BudgetTagDataTable from "./budget-tag-table";
import { budgetsSearchParamsCache } from "./search-params";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const {} = await budgetsSearchParamsCache.parse(searchParams);

  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const userId = session.userId;
  // const budgetCategories = await QUERIES.getCategoriesWithBudgets(userId, 2025);
  const budgetTags = await QUERIES.getBudgetWithTagForUser(userId);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-5 pt-0">
        {/* <BudgetCategoryDataTable /> */}
        {/* <Component data={budgetCategories} /> */}
        <BudgetTagDataTable budgets={budgetTags} />
      </div>

      {/* <AddCategoryDrawerDialog categories={categories} />
      <EditCategoryDrawerDialog categories={categories} /> */}
    </>
  );
}
