import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getColorFromName } from "~/shared/helpers/categories";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { CategoryColor } from "../category";
import { Spinner } from "../load-more";
import { ComboboxDropdown } from "../ui/combobox-dropdown";

type Selected = {
  id: string;
  name: string;
  color?: string | null;
  slug: string;
  children?: Selected[];
};

type Props = {
  selected?: Selected;
  onChange: (selected: Selected) => void;
  headless?: boolean;
  hideLoading?: boolean;
};

type CategoryType = {
  id: string;
  name: string;
  color: string | null;
  slug: string | null;
  description: string | null;
  parentId: string | null;
  children?: CategoryType[];
};

type CategoryTransformedType = {
  id: string;
  label: string;
  color: string;
  slug: string;
  children: CategoryTransformedType[];
};

type CategoryFlattenedType = CategoryTransformedType & {
  isChild: boolean;
  parentId?: string;
};

function transformCategory(category: CategoryType): CategoryTransformedType {
  return {
    id: category.id,
    label: category.name,
    color: category.color ?? getColorFromName(category.name) ?? "#606060",
    slug: category.slug ?? "",
    children: category.children?.map(transformCategory) ?? [],
  };
}

// Flatten categories to include both parents and children
function flattenCategories(categories: CategoryTransformedType[]) {
  const flattened: CategoryFlattenedType[] = [];

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
  headless,
  hideLoading,
}: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(trpc.category.get.queryOptions({}));

  // Transform and flatten categories to include children
  const transformedCategories = data?.map(transformCategory) ?? [];
  const categories = flattenCategories(transformedCategories);

  const createCategoryMutation = useMutation(
    trpc.category.create.mutationOptions({
      onSuccess: (data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.category.get.queryKey({}),
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

  return (
    <ComboboxDropdown
      headless={headless}
      disabled={createCategoryMutation.isPending}
      placeholder="Select category"
      searchPlaceholder="Search category"
      items={categories}
      selectedItem={selectedValue}
      onSelect={(item) => {
        onChange({
          id: item.id,
          name: item.label,
          color: item.color,
          slug: item.slug,
        });
      }}
      {...(!headless && {
        onCreate: (value) => {
          createCategoryMutation.mutate({
            name: value,
            color: getColorFromName(value),
          });
        },
      })}
      renderSelectedItem={(selectedItem) => (
        <div className="flex items-center space-x-2">
          <CategoryColor color={selectedItem.color} />
          <span className="max-w-[90%] truncate text-left">
            {selectedItem.label}
          </span>
        </div>
      )}
      renderOnCreate={(value) => {
        if (!headless) {
          return (
            <div className="flex items-center space-x-2">
              <CategoryColor color={getColorFromName(value)} />
              <span>{`Create "${value}"`}</span>
            </div>
          );
        }
      }}
      renderListItem={({ item }) => {
        return (
          <div className="flex items-center space-x-2">
            <CategoryColor color={item.color} />
            <span className="line-clamp-1">{item.label}</span>
          </div>
        );
      }}
    />
  );
}
