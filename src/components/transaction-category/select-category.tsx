import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getColorFromName } from "~/shared/helpers/categories";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { Spinner } from "../load-more";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CategoryBadge, CategoryLabel } from "./category-badge";
import { CategoryColor } from "./category-color";

export type Category = RouterOutput["transactionCategory"]["get"][number];

export type CategoryOption = {
  id: string;
  label: string;
  color: string;
  icon: string;
  slug: string;
  children: CategoryOption[];
};

export type CategoryOptionWithChildren = Omit<CategoryOption, "children"> & {
  isChild: boolean;
  parentId?: string;
};

type Selected = {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  slug: string;
  children?: Selected[];
};

type Props = {
  selected?: Selected;
  onChange: (selected: Selected) => void;
  headless?: boolean;
  hideLoading?: boolean;
  align?: "end" | "start";
};

function transformCategory(category: Category): CategoryOption {
  return {
    id: category.id,
    label: category.name,
    color: category.color ?? getColorFromName(category.name) ?? "#606060",
    icon: category.icon ?? "circle-dashed",
    slug: category.slug ?? "",
    // @ts-expect-error we only have one level
    children: category.children?.map(transformCategory) ?? [],
  };
}

// Flatten categories to include both parents and children
function flattenCategories(
  categories: CategoryOption[],
): CategoryOptionWithChildren[] {
  const flattened: CategoryOptionWithChildren[] = [];

  for (const category of categories) {
    // Add parent category
    flattened.push({
      ...category,
      isChild: false,
    });

    // Add children if they exist
    if (category.children && category.children.length > 0) {
      for (const child of category.children) {
        flattened.push({
          ...child,
          label: `  ${child.label}`, // Add indentation for visual hierarchy
          isChild: true,
          parentId: category.id,
        });
      }
    }
  }

  return flattened;
}

export function SelectCategory({
  selected,
  onChange,
  hideLoading,
  headless,
  align,
}: Props) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.transactionCategory.get.queryOptions(),
  );

  // Transform and flatten categories to include children
  const transformedCategories = data?.map(transformCategory) ?? [];
  const categories = flattenCategories(transformedCategories);

  const filteredItems = categories.filter((item) =>
    item.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const showCreate = Boolean(inputValue) && !filteredItems.length;

  const createCategoryMutation = useMutation(
    trpc.transactionCategory.create.mutationOptions({
      onSuccess: (data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transactionCategory.get.queryKey(),
        });

        if (data) {
          onChange({
            id: data.id,
            name: data.name,
            color: data.color,
            slug: data.slug,
          });
        }
      },
    }),
  );

  // @ts-expect-error - slug is not nullable
  const selectedValue = selected ? transformCategory(selected) : undefined;

  if (!selected && isLoading && !hideLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const Component = (
    <Command loop shouldFilter={false}>
      <CommandInput
        value={inputValue}
        onValueChange={setInputValue}
        placeholder={"Search category..."}
        className="px-1"
      />

      <CommandGroup>
        <CommandList className="max-h-[225px] overflow-auto">
          {filteredItems.map((item) => {
            return (
              <CommandItem
                disabled={createCategoryMutation.isPending}
                className="cursor-pointer"
                key={item.id}
                value={item.id}
                onSelect={(id) => {
                  const foundItem = categories.find((item) => item.id === id);

                  if (!foundItem) {
                    return;
                  }

                  onChange({
                    id: foundItem.id,
                    name: foundItem.label,
                    color: foundItem.color,
                    slug: foundItem.slug,
                  });
                }}
              >
                <CategoryLabel
                  category={{
                    name: item.label,
                    color: item.color,
                    icon: item.icon,
                  }}
                />
              </CommandItem>
            );
          })}

          <CommandEmpty>{"No category found"}</CommandEmpty>

          {showCreate && (
            <CommandItem
              key={inputValue}
              value={inputValue}
              onSelect={() => {
                createCategoryMutation.mutate({
                  name: inputValue,
                  color: getColorFromName(inputValue),
                });
                setInputValue("");
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            >
              <div className="flex items-center space-x-2">
                <CategoryColor color={getColorFromName(inputValue)} />
                <span>{`Create "${inputValue}"`}</span>
              </div>
            </CommandItem>
          )}
        </CommandList>
      </CommandGroup>
    </Command>
  );

  if (headless) {
    return Component;
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger
        asChild
        disabled={createCategoryMutation.isPending}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <CategoryBadge
          category={
            selectedValue
              ? {
                  name: selectedValue.label,
                  color: selectedValue.color,
                  icon: selectedValue.icon,
                }
              : undefined
          }
        />
      </PopoverTrigger>

      <PopoverContent
        className="max-w-[250px] p-0"
        align={align}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {Component}
      </PopoverContent>
    </Popover>
  );
}
