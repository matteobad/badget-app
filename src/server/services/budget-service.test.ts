import { describe, expect, it } from "bun:test";

import type { BudgetType, CategoryType } from "./budget-service";
import { CATEGORY_TYPE } from "../db/schema/enum";
import { findBudgetWarnings } from "./budget-service";

describe("findBudgetWarnings", () => {
  const categories: CategoryType[] = [
    {
      id: "root",
      parentId: null,
      name: "Root",
      slug: "root",
      type: CATEGORY_TYPE.INCOME,
      icon: "icon",
      color: "color",
      description: "desc",
    },
    {
      id: "a",
      parentId: "root",
      name: "A",
      slug: "a",
      type: CATEGORY_TYPE.INCOME,
      icon: "icon",
      color: "color",
      description: "desc",
    },
    {
      id: "b",
      parentId: "a",
      name: "B",
      slug: "b",
      type: CATEGORY_TYPE.INCOME,
      icon: "icon",
      color: "color",
      description: "desc",
    },
    {
      id: "c",
      parentId: "b",
      name: "C",
      slug: "c",
      type: CATEGORY_TYPE.INCOME,
      icon: "icon",
      color: "color",
      description: "desc",
    }, // profondità 3
  ];

  const budgets: BudgetType[] = [
    {
      id: "id_1",
      categoryId: "root",
      period: "month",
      startDate: new Date("2025-01-01"),
      endDate: null,
      amount: 300,
    },
    {
      id: "id_2",
      categoryId: "b",
      period: "month",
      startDate: new Date("2025-01-01"),
      endDate: null,
      amount: 200,
    },
    {
      id: "id_3",
      categoryId: "c",
      period: "month",
      startDate: new Date("2025-01-01"),
      endDate: null,
      amount: 150,
    },
  ];

  const budgetFilters = {
    from: new Date("2025-06-01"),
    to: new Date("2025-06-30"),
  };

  it("should detect overflow warning for root", () => {
    const result = findBudgetWarnings({ categories, budgets, budgetFilters });

    expect(result.length).toBe(1);
    expect(result[0]!.parentId).toBe("root");
    expect(Math.round(result[0]!.parentAmount)).toBe(300);
    expect(Math.round(result[0]!.childrenTotal)).toBe(350);
  });

  it("should not return warning if children budget is under parent", () => {
    const safeBudgets: BudgetType[] = [
      {
        id: "id_1",
        categoryId: "root",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 500,
      },
      {
        id: "id_2",
        categoryId: "b",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 200,
      },
      {
        id: "id_3",
        categoryId: "c",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 150,
      },
    ];

    const result = findBudgetWarnings({
      categories,
      budgets: safeBudgets,
      budgetFilters,
    });
    expect(result.length).toBe(0);
  });
});
