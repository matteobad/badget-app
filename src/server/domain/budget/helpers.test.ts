import { describe, expect, it } from "bun:test";

import type { BudgetType } from "./helpers";
import { getBudgetForPeriod } from "./helpers";

describe("getBudgetForPeriod", () => {
  it("should calculate weekly budget in June 2025", () => {
    const budgets: BudgetType[] = [
      {
        id: "id",
        categoryId: "categoryId",
        period: "week",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 100,
      },
    ];

    const total = getBudgetForPeriod(budgets, {
      from: new Date("2025-06-01"),
      to: new Date("2025-06-30"),
    });

    // Giugno 2025 ha 4 settimane + 2 giorni
    expect(Math.round(total)).toBe(429);
  });

  it("should calculate monthly budget for a single month", () => {
    const budgets: BudgetType[] = [
      {
        id: "id",
        categoryId: "categoryId",
        period: "month",
        startDate: new Date("2025-01-01"),
        endDate: null,
        amount: 300,
      },
    ];

    const total = getBudgetForPeriod(budgets, {
      from: new Date("2025-06-01"),
      to: new Date("2025-06-30"),
    });

    expect(Math.round(total)).toBe(300);
  });

  it("should calculate proportional custom budget", () => {
    const budgets: BudgetType[] = [
      {
        id: "id",
        categoryId: "categoryId",
        period: "custom",
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-06-11"), // 10 giorni totali
        amount: 100,
      },
    ];

    const total = getBudgetForPeriod(budgets, {
      from: new Date("2025-06-06"),
      to: new Date("2025-06-10"), // 5 giorni di overlap
    });

    expect(Math.round(total)).toBe(50);
  });

  it("should support custom start of week (Sunday)", () => {
    const budgets: BudgetType[] = [
      {
        id: "id",
        categoryId: "categoryId",
        period: "week",
        startDate: new Date("2025-06-01"),
        endDate: null,
        amount: 140,
      },
    ];

    const total = getBudgetForPeriod(
      budgets,
      {
        from: new Date("2025-06-01"), // Sunday
        to: new Date("2025-06-07"),
      },
      { startOfWeek: 0 }, // Sunday
    );

    expect(Math.round(total)).toBe(140);
  });
});
