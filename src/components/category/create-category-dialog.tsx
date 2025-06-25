"use client";

import { useBudgetParams } from "~/hooks/use-budget-params";
import { useCategoryParams } from "~/hooks/use-category-params";

import CreateBudgetForm from "../budget/create-budget-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import CreateCategoryForm from "./create-category-form";

export default function CreateCategoryDialog() {
  const { params: categoryParams, setParams: setCategoryParams } =
    useCategoryParams();
  const { params: budgetParams, setParams: setbudgetParams } =
    useBudgetParams();

  const isOpen = !!categoryParams.createCategory || !!budgetParams.createBudget;

  const onOpenChange = () => {
    void setCategoryParams(null);
    void setbudgetParams(null);
  };

  const CreateForm = () => {
    return (
      <>
        {categoryParams.createCategory && <CreateCategoryForm />}
        {budgetParams.createBudget && <CreateBudgetForm />}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex h-full flex-col">
          <DialogHeader className="mb-6">
            <DialogTitle>Nuova categoria</DialogTitle>
          </DialogHeader>

          <CreateForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
