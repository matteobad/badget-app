import type {
  BudgetRecurrenceType,
  CategoryType,
} from "~/shared/constants/enum";
import { CATEGORY_TYPE } from "~/shared/constants/enum";
import { differenceInCalendarDays, max, min } from "date-fns";

export type BudgetInstance = {
  originalBudgetId: string;
  categoryId: string;
  amount: number;
  from: Date;
  to: Date;
  recurrence: BudgetRecurrenceType | null;
};

export type Category = {
  id: string;
  parentId: string | null;
  name: string;
  color: string | null;
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
  incomePercentage?: number; // Optional to be filled later
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
export function buildCategoryAccrual(
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
  const enrichedNodes = nodes.map((n) => ({
    ...n,
    incomePercentage: totalIncome > 0 ? n.accrualAmount / totalIncome : 0,
  }));

  // Third pass: fill root category and not allocated budget
  const tree = enrichedNodes.map((node) => {
    return node.category.parentId
      ? node
      : {
          ...node,
          category: {
            ...node.category,
            parentId: "root",
          },
        };
  });

  const roots = tree.filter(
    (n) =>
      n.category.parentId === "root" &&
      n.category.type !== CATEGORY_TYPE.INCOME,
  );
  const notAllocated =
    totalIncome -
    roots.reduce(
      (tot, value) =>
        (tot += Math.max(value.accrualAmount, value.childrenAccrualAmount)),
      0,
    );

  // TODO: add root category for tree view render and remaining

  // Sort order for category types
  const CATEGORY_SORT_ORDER = [
    CATEGORY_TYPE.INCOME,
    CATEGORY_TYPE.EXPENSE,
    CATEGORY_TYPE.TRANSFER,
  ];

  function getCategorySortIndex(type: CategoryType) {
    const idx = CATEGORY_SORT_ORDER.indexOf(type);
    return idx === -1 ? CATEGORY_SORT_ORDER.length : idx;
  }

  // Sort the tree before returning
  const sortedTree = [
    ...tree,
    {
      category: {
        id: "root",
        name: "root",
        parentId: null,
        color: null,
        icon: null,
        type: CATEGORY_TYPE.TRANSFER,
      },
      budgetInstances: [],
      accrualAmount: notAllocated,
      childrenAccrualAmount: notAllocated,
      incomePercentage:
        totalIncome > 0 ? (notAllocated / totalIncome) * 100 : 0,
    },
  ].sort(
    (a, b) =>
      getCategorySortIndex(a.category.type) -
      getCategorySortIndex(b.category.type),
  );

  return sortedTree;
}

/**
 * Input for an optimistic budget update.
 */
export interface OptimisticBudgetUpdateInput {
  id: string; // originalBudgetId
  amount: number;
  categoryId: string;
  recurrence: BudgetInstance["recurrence"];
  from: Date;
  to: Date;
}

/**
 * Returns a new array of BudgetInstances with the updated instance applied.
 */
function updateBudgetInstances(
  instances: BudgetInstance[],
  update: OptimisticBudgetUpdateInput,
): BudgetInstance[] {
  let found = false;
  const updated = instances.map((bi) => {
    if (bi.originalBudgetId === update.id) {
      found = true;
      return {
        ...bi,
        amount: update.amount,
        recurrence: update.recurrence,
        from: update.from,
        to: update.to,
      };
    }
    return bi;
  });
  // If not found, add as new
  if (!found) {
    updated.push({
      originalBudgetId: update.id,
      categoryId: update.categoryId,
      amount: update.amount,
      recurrence: update.recurrence,
      from: update.from,
      to: update.to,
    });
  }
  return updated;
}

/**
 * Given the current category tree and a budget update, returns a new tree with all aggregates updated.
 * This is a pure function suitable for optimistic updates.
 */
export function optimisticallyUpdateCategoryWithBudgets(
  tree: CategoryWithAccrual[],
  update: OptimisticBudgetUpdateInput,
  period: Period,
): CategoryWithAccrual[] {
  // 1. Flatten categories and budgetInstances from the tree
  const categories: Category[] = tree.map((n) => n.category);
  let budgetInstances: BudgetInstance[] = [];
  for (const n of tree)
    budgetInstances = budgetInstances.concat(n.budgetInstances);

  // 2. Update the relevant budget instance
  budgetInstances = updateBudgetInstances(budgetInstances, update);

  // 3. Rebuild the tree using the same logic as buildCategoryAccrual
  //    (imported from server/domain/category/helpers)
  //    This ensures all aggregates are recalculated correctly.
  //    (If you want to avoid importing, you can inline the logic here.)
  //
  //    Note: If the tree contains the special 'root' node, filter it out before rebuilding.
  const filteredCategories = categories.filter((c) => c.id !== "root");
  return buildCategoryAccrual(filteredCategories, budgetInstances, period);
}
