"use server";

import { getUserCategories } from "~/server/db/queries/cached-queries";
import { CategoryTable } from "./category-table";

export async function CategoryListServer() {
  const userCategories = await getUserCategories({});

  return <CategoryTable data={userCategories} />;
}
