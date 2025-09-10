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
import { CategoryLabel } from "./category-badge";
import { CategoryColor } from "./category-color";

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
};

function transformCategory(category: {
  id: string;
  name: string;
  color: string | null;
  slug: string | null;
  description: string | null;
  system: boolean | null;
  parentId: string | null;
  children?: any[];
}): {
  id: string;
  label: string;
  color: string;
  slug: string;
  children: any[];
} {
  return {
    id: category.id,
    label: category.name,
    color: category.color ?? getColorFromName(category.name) ?? "#606060",
    slug: category.slug ?? "",
    children: category.children?.map(transformCategory) ?? [],
  };
}

// Flatten categories to include both parents and children
function flattenCategories(categories: any[]): any[] {
  const flattened: any[] = [];

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

export function SelectCategoryHeadless({
  selected,
  onChange,
  hideLoading,
}: Props) {
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
        queryClient.invalidateQueries({
          queryKey: trpc.transactionCategory.get.queryKey(),
        });

        if (data) {
          onChange({
            id: data.id,
            name: data.name,
            color: data.color,
            slug: data.slug!,
          });
        }
      },
    }),
  );

  if (!selected && isLoading && !hideLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
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
                disabled={item.disabled}
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
}
