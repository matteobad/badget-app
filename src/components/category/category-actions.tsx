"use client";

import { Button } from "~/components/ui/button";
import { useCategoryParams } from "~/hooks/use-category-params";
import { PlusIcon } from "lucide-react";

export const CategoryActions = () => {
  const { setParams } = useCategoryParams();

  return (
    <div className="flex items-center gap-4">
      <Button onClick={() => void setParams({ createCategory: true })}>
        <PlusIcon className="size-4" />
        Crea
      </Button>
    </div>
  );
};
