"use client";

import dynamicIconImports from "lucide-react/dynamicIconImports";

import { Category } from "~/app/old/banking/transactions/_components/transactions-table";
import { euroFormat } from "~/lib/utils";
import { DeleteCategoryForm } from "./forms/delete-category-form";
import { EditCategoryBudgetForm } from "./forms/edit-category-budget-form";
import { EditCategoryForm } from "./forms/edit-category-form";
import Icon from "./icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

type CategoryDetailsProps = {
  id: string;
  categories: Category[];
};

export function CategoryDetails({ id, categories }: CategoryDetailsProps) {
  const category = categories.find((c) => c.id.toString() === id);

  if (!category) return;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <span className="text-sm capitalize text-slate-500">
          {category?.type}
        </span>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-4">
          <Icon
            name={category?.icon as keyof typeof dynamicIconImports}
            className="h-10 w-10"
          />
          <div className="flex flex-col capitalize">
            <span className="text-lg">{category?.name}</span>
            <span className="text-sm font-light text-slate-500">
              {category?.macro}
            </span>
          </div>
        </div>
        <span className="mt-4 text-4xl font-semibold">
          {euroFormat(category?.budgets[0]?.budget ?? 0)}
          <span className="px-2 text-sm font-light lowercase text-slate-500">
            / {category?.budgets[0]?.period}
          </span>
        </span>
      </div>
      <Accordion type="single" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Dettagli</AccordionTrigger>
          <AccordionContent>
            <EditCategoryForm id={id} categories={categories} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Budgets</AccordionTrigger>
          <AccordionContent>
            <EditCategoryBudgetForm
              categoryId={id}
              budgets={category?.budgets}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Danger Zone</AccordionTrigger>
          <AccordionContent>
            <DeleteCategoryForm name={category.name} id={id} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
