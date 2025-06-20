import { describe, expect, it } from "bun:test";

import type { BudgetType, CategoryType } from "./budget-service";
import { CATEGORY_TYPE } from "../db/schema/enum";
import { findBudgetWarnings } from "./budget-service";

describe("findBudgetWarnings", () => {
  const budgetFilters = {
    from: new Date("2025-06-01"),
    to: new Date("2025-06-30"),
  };

  it("should detect overflow warning for root", () => {
    const categories: CategoryType[] = [
      {
        id: "income_id",
        parentId: null,
        name: "Income",
        slug: "income",
        type: CATEGORY_TYPE.INCOME,
        icon: "icon",
        color: "color",
        description: "desc",
      },
      {
        id: "a",
        parentId: "income_id",
        name: "A",
        slug: "a",
        type: CATEGORY_TYPE.INCOME,
        icon: "icon",
        color: "color",
        description: "desc",
      },
      {
        id: "b",
        parentId: "income_id",
        name: "B",
        slug: "b",
        type: CATEGORY_TYPE.INCOME,
        icon: "icon",
        color: "color",
        description: "desc",
      },
    ];

    const budgets: BudgetType[] = [
      {
        id: "id_1",
        categoryId: "income_id",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 1000,
      },
      {
        id: "id_2",
        categoryId: "a",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 500,
      },
      {
        id: "id_3",
        categoryId: "b",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 600,
      },
    ];

    const result = findBudgetWarnings(categories, budgets, budgetFilters);

    expect(result.length).toBe(1);
    expect(result[0]!.parentId).toBe("income_id");
    expect(Math.round(result[0]!.parentAmount)).toBe(1000);
    expect(Math.round(result[0]!.childrenTotal)).toBe(1100);
  });

  it("should not return warning if children budget is under parent", () => {
    const categories: CategoryType[] = [
      {
        id: "income_id",
        parentId: null,
        name: "Income",
        slug: "income",
        type: CATEGORY_TYPE.INCOME,
        icon: "icon",
        color: "color",
        description: "desc",
      },
      {
        id: "a",
        parentId: "income_id",
        name: "A",
        slug: "a",
        type: CATEGORY_TYPE.INCOME,
        icon: "icon",
        color: "color",
        description: "desc",
      },
      {
        id: "b",
        parentId: "income_id",
        name: "B",
        slug: "b",
        type: CATEGORY_TYPE.INCOME,
        icon: "icon",
        color: "color",
        description: "desc",
      },
    ];

    const budgets: BudgetType[] = [
      {
        id: "id_1",
        categoryId: "income_id",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 1100,
      },
      {
        id: "id_2",
        categoryId: "a",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 500,
      },
      {
        id: "id_3",
        categoryId: "b",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 600,
      },
    ];

    const result = findBudgetWarnings(categories, budgets, budgetFilters);
    expect(result.length).toBe(0);
  });

  it("should not detect warning double counting children and nephew budget", () => {
    const categories: CategoryType[] = [
      {
        id: "expense_id",
        parentId: null,
        name: "Expense",
        slug: "expense",
        type: CATEGORY_TYPE.EXPENSE,
        icon: "icon",
        color: "color",
        description: "desc",
      },
      {
        id: "food_id",
        parentId: "expense_id",
        name: "Food",
        slug: "food",
        type: CATEGORY_TYPE.EXPENSE,
        icon: "icon",
        color: "color",
        description: "desc",
      },
      {
        id: "groceries_id",
        parentId: "food_id",
        name: "Groceries",
        slug: "groceries",
        type: CATEGORY_TYPE.EXPENSE,
        icon: "icon",
        color: "color",
        description: "desc",
      },
      {
        id: "restaurant_id",
        parentId: "food_id",
        name: "Restaurant",
        slug: "restaurant",
        type: CATEGORY_TYPE.EXPENSE,
        icon: "icon",
        color: "color",
        description: "desc",
      },
    ];

    const budgets: BudgetType[] = [
      {
        id: "id_1",
        categoryId: "expense_id",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 1000,
      },
      {
        id: "id_2",
        categoryId: "food_id",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 500,
      },
      {
        id: "id_3",
        categoryId: "groceries_id",
        period: "week",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 100,
      },
      {
        id: "id_3",
        categoryId: "restaurant_id",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 100,
      },
    ];

    const result = findBudgetWarnings(categories, budgets, budgetFilters);
    expect(result.length).toBe(1);
    expect(result[0]!.parentId).toBe("food_id");
    expect(Math.round(result[0]!.parentAmount)).toBe(500);
    expect(Math.round(result[0]!.childrenTotal)).toBe(529);
  });

  it("should detect 2 warning on different level of the tree", () => {
    const categories: CategoryType[] = [
      {
        id: "expense_id",
        parentId: null,
        name: "Expense",
        slug: "expense",
        type: CATEGORY_TYPE.EXPENSE,
        icon: "icon",
        color: "color",
        description: "desc",
      },
      {
        id: "housing_id",
        parentId: "expense_id",
        name: "Housing",
        slug: "housing",
        type: CATEGORY_TYPE.EXPENSE,
        icon: "icon",
        color: "color",
        description: "desc",
      },
      {
        id: "food_id",
        parentId: "expense_id",
        name: "Food",
        slug: "food",
        type: CATEGORY_TYPE.EXPENSE,
        icon: "icon",
        color: "color",
        description: "desc",
      },
      {
        id: "groceries_id",
        parentId: "food_id",
        name: "Groceries",
        slug: "groceries",
        type: CATEGORY_TYPE.EXPENSE,
        icon: "icon",
        color: "color",
        description: "desc",
      },
      {
        id: "restaurant_id",
        parentId: "food_id",
        name: "Restaurant",
        slug: "restaurant",
        type: CATEGORY_TYPE.EXPENSE,
        icon: "icon",
        color: "color",
        description: "desc",
      },
    ];

    const budgets: BudgetType[] = [
      {
        id: "id_1",
        categoryId: "expense_id",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 1000,
      },
      {
        id: "id_2",
        categoryId: "housing_id",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 500,
      },
      {
        id: "id_2",
        categoryId: "food_id",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 500,
      },
      {
        id: "id_3",
        categoryId: "groceries_id",
        period: "week",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 100,
      },
      {
        id: "id_3",
        categoryId: "restaurant_id",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 100,
      },
    ];

    const result = findBudgetWarnings(categories, budgets, budgetFilters);
    expect(result.length).toBe(2);
    expect(result[0]!.parentId).toBe("expense_id");
    expect(Math.round(result[0]!.parentAmount)).toBe(1000);
    expect(Math.round(result[0]!.childrenTotal)).toBe(1029);
    expect(result[1]!.parentId).toBe("food_id");
    expect(Math.round(result[1]!.parentAmount)).toBe(500);
    expect(Math.round(result[1]!.childrenTotal)).toBe(529);
  });
});
