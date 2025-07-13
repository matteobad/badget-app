import type { CategoryType } from "~/server/db/schema/enum";
import type { TreeNode, WithIdAndParentId } from "~/shared/types";
import { CATEGORY_TYPE } from "~/server/db/schema/enum";
import { differenceInCalendarDays, max, min } from "date-fns";

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

export type BudgetInstance = {
  categoryId: string;
  amount: number;
  from: Date;
  to: Date;
};

export type Category = {
  id: string;
  parentId: string | null;
  name: string;
  icon: string | null;
  type: CategoryType;
};

export type Period = {
  from: Date;
  to: Date;
};

export type CategoryWithAccrual = {
  category: Category;
  budgetInstances: BudgetInstance[];
  accrualAmount: number;
  childrenAccrualAmount: number;
  incomePercentage: number; // Optional to be filled later
};

// Computes prorated amount of budget in period
function computeAccrual(instance: BudgetInstance, period: Period): number {
  const overlapStart = max([instance.from, period.from]);
  const overlapEnd = min([instance.to, period.to]);

  if (overlapEnd < overlapStart) return 0;

  const instanceDays = differenceInCalendarDays(instance.to, instance.from) + 1;
  const overlapDays = differenceInCalendarDays(overlapEnd, overlapStart) + 1;

  const dailyAmount = instance.amount / instanceDays;
  return dailyAmount * overlapDays;
}

// Builds tree and accumulates accrual amounts recursively
export function buildCategoryAccrualTree(
  categories: Category[],
  budgetInstances: BudgetInstance[],
  period: Period,
): CategoryWithAccrual[] {
  const byCategory: Record<string, BudgetInstance[]> = {};
  for (const bi of budgetInstances) {
    byCategory[bi.categoryId] ||= [];
    // @ts-expect-error bad typings
    byCategory[bi.categoryId].push(bi);
  }

  const byId = Object.fromEntries(categories.map((c) => [c.id, c]));
  const childrenMap: Record<string, string[]> = {};
  for (const c of categories) {
    if (!c.parentId) continue;
    childrenMap[c.parentId] ||= [];
    // @ts-expect-error bad typings
    childrenMap[c.parentId].push(c.id);
  }

  function recurse(categoryId: string): {
    accrual: number;
    childrenAccrual: number;
    node: Omit<CategoryWithAccrual, "incomePercentage">;
  } {
    const category = byId[categoryId]!;
    const ownInstances = byCategory[categoryId] ?? [];
    const ownAccrual = ownInstances.reduce(
      (sum, bi) => sum + computeAccrual(bi, period),
      0,
    );

    let childrenAccrual = 0;
    if (childrenMap[categoryId]) {
      for (const childId of childrenMap[categoryId]) {
        const { accrual, childrenAccrual: nestedChildrenAccrual } =
          recurse(childId);
        childrenAccrual += accrual + nestedChildrenAccrual;
      }
    }

    return {
      accrual: ownAccrual,
      childrenAccrual,
      node: {
        category,
        budgetInstances: ownInstances,
        accrualAmount: ownAccrual,
        childrenAccrualAmount: childrenAccrual,
      },
    };
  }

  // First pass: build tree and collect nodes
  const nodes = categories.map((root) => recurse(root.id).node);

  // Find totalIncome: max of accrualAmount or childrenAccrualAmount for root income categories
  const incomeRoots = nodes.filter(
    (n) =>
      n.category.parentId === null && n.category.type === CATEGORY_TYPE.INCOME,
  );
  const totalIncome = Math.max(
    0,
    ...incomeRoots.map((n) =>
      Math.max(n.accrualAmount, n.childrenAccrualAmount),
    ),
  );

  // Second pass: fill incomePercentage
  return nodes.map((n) => ({
    ...n,
    incomePercentage:
      totalIncome > 0 ? (n.accrualAmount / totalIncome) * 100 : 0,
  }));
}
