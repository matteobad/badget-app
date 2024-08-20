"use client";

import { Category } from "~/app/(dashboard)/banking/transactions/_components/transactions-table";
import { EditCategoryForm } from "./forms/edit-category-form";

type CategoryDetailsProps = {
  id: string;
  categories: Category[];
};

export function CategoryDetails({ id, categories }: CategoryDetailsProps) {
  return (
    <div className="flex flex-col gap-6">
      <EditCategoryForm id={id} categories={categories} />
    </div>
  );
}
