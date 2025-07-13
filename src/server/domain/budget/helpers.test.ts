import { describe, expect, it } from "bun:test";

import type { BudgetType } from "./helpers";
import {
  diffBudgetUpdate,
  getBudgetForPeriod,
  getNextCycleStart,
  hasFutureBudget,
} from "./helpers";

describe("getBudgetForPeriod", () => {
  it("should calculate weekly budget in June 2025", () => {
    const budgets: BudgetType[] = [
      {
        id: "id",
        categoryId: "categoryId",
        recurrence: "weekly",
        from: new Date("2025-01-01"),
        to: null,
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
        recurrence: "monthly",
        from: new Date("2025-01-01"),
        to: null,
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
        recurrence: "custom",
        from: new Date("2025-06-01"),
        to: new Date("2025-06-11"), // 10 giorni totali
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
        recurrence: "weekly",
        from: new Date("2025-06-01"),
        to: null,
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

describe("diffBudgetUpdate", () => {
  const base: BudgetType = {
    id: "id",
    categoryId: "cat",
    recurrence: "monthly",
    from: new Date("2025-01-01"),
    to: null,
    amount: 100,
  };

  it("detects only amount change", () => {
    const diff = diffBudgetUpdate(base, { amount: 200 });
    expect(diff).toEqual({
      amountChanged: true,
      frequencyChanged: false,
      repetitionChanged: false,
      startDateChanged: false,
    });
  });

  it("detects only frequency change", () => {
    const diff = diffBudgetUpdate(base, { recurrence: "weekly" });
    expect(diff.frequencyChanged).toBe(true);
  });

  it("detects only repetition change (open to close)", () => {
    const diff = diffBudgetUpdate(base, { to: new Date("2025-02-01") });
    expect(diff.repetitionChanged).toBe(true);
  });

  it("detects only repetition change (close to open)", () => {
    const closed = { ...base, endDate: new Date("2025-02-01") };
    const diff = diffBudgetUpdate(closed, { to: null });
    expect(diff.repetitionChanged).toBe(true);
  });

  it("detects only startDate change", () => {
    const diff = diffBudgetUpdate(base, { from: new Date("2025-02-01") });
    expect(diff.startDateChanged).toBe(true);
  });
});

describe("getNextCycleStart", () => {
  it("returns next week", () => {
    const d = new Date("2025-01-01");
    const next = getNextCycleStart(d, "week");
    expect(next.getDate()).toBe(8);
  });
  it("returns next month", () => {
    const d = new Date("2025-01-01");
    const next = getNextCycleStart(d, "month");
    expect(next.getMonth()).toBe(1); // February
  });
  it("returns next year", () => {
    const d = new Date("2025-01-01");
    const next = getNextCycleStart(d, "year");
    expect(next.getFullYear()).toBe(2026);
  });
});

describe("hasFutureBudget", () => {
  const base: BudgetType = {
    id: "id",
    categoryId: "cat",
    recurrence: "monthly",
    from: new Date("2025-01-01"),
    to: null,
    amount: 100,
  };
  it("returns false if no future budget", () => {
    expect(hasFutureBudget([base], "cat", new Date("2025-02-01"))).toBe(false);
  });
  it("returns true if future budget exists", () => {
    const future = { ...base, id: "id2", startDate: new Date("2025-03-01") };
    expect(hasFutureBudget([base, future], "cat", new Date("2025-02-01"))).toBe(
      true,
    );
  });
});
