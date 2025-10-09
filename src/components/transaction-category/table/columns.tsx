"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronRight,
  GitBranchPlus,
  MoreHorizontalIcon,
  SquarePenIcon,
  TrashIcon,
} from "lucide-react";
import type { IconName } from "lucide-react/dynamic";
import { memo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useI18n } from "~/shared/locales/client";
import { CategoryBadge } from "../category-badge";
import { CreateSubCategoryModal } from "../modals/create-transaction-subcategory-modal";
import { EditCategoryModal } from "../modals/edit-transaction-category-modal";

export type Category = RouterOutput["transactionCategory"]["get"][number];

export type CategoryWithChildren = Omit<Category, "children"> & {
  isChild: boolean;
  hasChildren: boolean;
};

// Component to display category description from localization
function CategoryTooltip({ category }: { category: CategoryWithChildren }) {
  const t = useI18n();

  // Priority 1: User-defined description
  if (category.description) {
    return <span>{category.description}</span>;
  }

  // Priority 2: System description from localization
  try {
    return (
      // @ts-expect-error - slug is not nullable
      <span>{t(`transaction_categories.${category.slug}`)}</span>
    );
  } catch {
    // Fallback if translation not found
    return <span>Category description not available</span>;
  }
}

// Flatten categories to include both parents and children with hierarchy info
export function flattenCategories(categories: Category[]) {
  const flattened: CategoryWithChildren[] = [];

  for (const category of categories) {
    // Add parent category
    flattened.push({
      ...category,
      isChild: false,
      hasChildren: category.children && category.children.length > 0,
    });

    // Add children if they exist
    if (category.children && category.children.length > 0) {
      for (const child of category.children) {
        flattened.push({
          ...child,
          isChild: true,
          parentId: category.id,
          hasChildren: false,
        });
      }
    }
  }

  return flattened;
}

const NameCell = memo(
  ({
    category,
    expandedCategories,
    setExpandedCategories,
  }: {
    category: CategoryWithChildren;
    expandedCategories: Set<string>;
    setExpandedCategories: React.Dispatch<React.SetStateAction<Set<string>>>;
  }) => {
    // Get expanded state from table meta or use local state as fallback
    const tableExpandedCategories = expandedCategories;
    const setTableExpandedCategories = setExpandedCategories;

    const isExpanded = tableExpandedCategories.has(category.id);
    const hasChildren = category.hasChildren;
    const isChild = category.isChild;

    const toggleExpanded = () => {
      const newExpanded = new Set(tableExpandedCategories);
      if (isExpanded) {
        newExpanded.delete(category.id);
      } else {
        newExpanded.add(category.id);
      }
      setTableExpandedCategories(newExpanded);
    };

    return (
      <div className={cn("flex items-center space-x-2", isChild && "ml-10")}>
        {hasChildren && !isChild && (
          <Button
            variant="ghost"
            size="icon"
            className="size-4 p-0 hover:bg-transparent"
            onClick={toggleExpanded}
          >
            {isExpanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </Button>
        )}
        {!hasChildren && !isChild && <div className="w-4" />}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <CategoryBadge
                category={category}
                className={cn(
                  hasChildren && !isChild ? "cursor-pointer" : "cursor-default",
                )}
                onClick={hasChildren && !isChild ? toggleExpanded : undefined}
              />
            </TooltipTrigger>
            <TooltipContent
              className="px-3 py-1.5 text-xs"
              side="right"
              sideOffset={10}
            >
              <CategoryTooltip category={category} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {category.system && (
          <span className="border border-border px-2 py-1 font-mono text-xs text-muted-foreground">
            System
          </span>
        )}
        {category.excluded && (
          <span className="border border-border px-2 py-1 font-mono text-xs text-muted-foreground">
            Excluded
          </span>
        )}
      </div>
    );
  },
);
NameCell.displayName = "NameCell";

const ActionsCell = memo(
  ({
    category,
    deleteCategory,
  }: {
    category: CategoryWithChildren;
    deleteCategory: (categoryId: string) => void;
  }) => {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCreateSubcategoryOpen, setIsCreateSubcategoryOpen] =
      useState(false);

    return (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
              <SquarePenIcon className="size-3.5" />
              Edit
            </DropdownMenuItem>

            {!category.isChild && (
              <DropdownMenuItem
                onClick={() => setIsCreateSubcategoryOpen(true)}
              >
                <GitBranchPlus className="size-3.5" />
                Add Subcategory
              </DropdownMenuItem>
            )}

            {!category.system && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => deleteCategory(category.id)}
                >
                  <TrashIcon className="size-3.5" />
                  Remove
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <EditCategoryModal
          id={category.id}
          defaultValue={{
            ...category,
            color: category.color ?? "#525252",
            icon: (category.icon as IconName) ?? "circle-dashed",
          }}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
        />

        <CreateSubCategoryModal
          isOpen={isCreateSubcategoryOpen}
          onOpenChange={setIsCreateSubcategoryOpen}
          parentId={category.id}
          defaultColor={category.color ?? "#525252"}
          defaultIcon={(category.icon as IconName) ?? "circle-dashed"}
          defaultExcluded={category.excluded ?? undefined}
        />
      </div>
    );
  },
);
ActionsCell.displayName = "ActionsCell";

export const columns: ColumnDef<CategoryWithChildren>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row, table }) => {
      const meta = table.options.meta!;

      return (
        <NameCell
          category={row.original}
          expandedCategories={meta.expandedCategories!}
          setExpandedCategories={meta.setExpandedCategories!}
        />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta!;

      return (
        <ActionsCell
          category={row.original}
          deleteCategory={meta.deleteCategory!}
        />
      );
    },
  },
];
