"use client";

import { Button } from "~/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";

import { CreateCategoryButton } from "./create-category-button";

export const CategoryActions = () => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost">
        <MoreHorizontalIcon className="size-4" />
      </Button>
      <CreateCategoryButton />
    </div>
  );
};
