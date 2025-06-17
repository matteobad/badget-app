"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { TreeNode } from "~/shared/types";
import type { dynamicIconImports } from "lucide-react/dynamic";
import { cn } from "~/lib/utils";
import { DynamicIcon } from "lucide-react/dynamic";

import { getIconColors } from "../utils";

type Category = RouterOutput["category"]["getCategoryTree"][number][0];

type CategoryTreeNode = TreeNode<Category>;

export function CategoryIcon({ item }: { item: CategoryTreeNode }) {
  const [category, children] = item;
  const hasChildren = children.length > 0;

  if (!hasChildren) {
    return (
      <DynamicIcon
        name={category.icon as keyof typeof dynamicIconImports}
        className={cn("size-5 text-primary")}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-5 items-center justify-center rounded border border-dashed",
        getIconColors(category.type),
      )}
    >
      <span className="">{children.length}</span>
    </div>
  );
}
