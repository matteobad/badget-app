import type { CategoryType } from "~/server/db/schema/enum";
import type { getCategoriesWithBudgets } from "~/server/services/category-service";
import type { TreeNode, WithIdAndParentId } from "~/shared/types";
import { CATEGORY_TYPE } from "~/server/db/schema/enum";

export const buildCategoryTree = <T extends WithIdAndParentId>(data: T[]) => {
  const lookup = new Map<string, TreeNode<T>>();
  const roots: TreeNode<T>[] = [];

  for (const item of data) {
    const node = lookup.get(item.id) ?? [item, []];
    node[0] = item; // aggiorna con l'oggetto completo
    lookup.set(item.id, node);

    if (item.parentId === null) {
      roots.push(node);
    } else {
      const parent = lookup.get(item.parentId) ?? [
        { ...({ id: item.parentId, parentId: null } as T) },
        [],
      ];
      lookup.set(item.parentId, parent);
      parent[1].push(node);
    }
  }

  // TODO: move to method for single responsability and test
  const typeOrder: Record<CategoryType, number> = {
    [CATEGORY_TYPE.INCOME]: 0,
    [CATEGORY_TYPE.EXPENSE]: 1,
    [CATEGORY_TYPE.SAVINGS]: 2,
    [CATEGORY_TYPE.INVESTMENTS]: 3,
    [CATEGORY_TYPE.TRANSFER]: 4,
  };

  function getTypeOrder(node: TreeNode<T>) {
    // @ts-expect-error: type property expected on T
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return typeOrder[node[0]?.type] ?? 99;
  }

  roots.sort((a, b) => getTypeOrder(a) - getTypeOrder(b));
  return roots;
};

type CategoryWithBudgets = Awaited<
  ReturnType<typeof getCategoriesWithBudgets>
>[number];

export const buildTreeData = (
  data: CategoryWithBudgets[],
): Record<string, CategoryWithBudgets> => {
  // Step 1: Create a map of id -> category (with empty children)
  const map: Record<string, CategoryWithBudgets> = {
    root_id: {
      id: "root_id",
      name: "root",
      slug: "root",
      budgets: [],
      color: "",
      icon: "",
      description: "",
      parentId: null,
      type: CATEGORY_TYPE.TRANSFER,
      children: data.filter((c) => c.parentId === null).map((c) => c.id),
    },
  };

  for (const item of data) {
    map[item.id] = { ...item, children: [] };
  }

  // Step 2: Populate children arrays
  for (const item of data) {
    if (item.parentId) {
      map[item.parentId]!.children.push(item.id);
    }
  }

  return map;
};
