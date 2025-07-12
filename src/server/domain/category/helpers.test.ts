import { describe, expect, it } from "bun:test";

import { buildCategoryTree } from "./helpers";

describe("buildCategoryTree", () => {
  it("should build a tree with a single root node", () => {
    const data = [{ id: "1", parentId: null, name: "Root" }];
    const tree = buildCategoryTree(data);
    expect(tree).toEqual([[{ id: "1", parentId: null, name: "Root" }, []]]);
  });

  it("should build a tree with nested children", () => {
    const data = [
      { id: "1", parentId: null, name: "Root" },
      { id: "2", parentId: "1", name: "Child 1" },
      { id: "3", parentId: "1", name: "Child 2" },
      { id: "4", parentId: "2", name: "Grandchild" },
    ];
    const tree = buildCategoryTree(data);
    expect(tree).toEqual([
      [
        { id: "1", parentId: null, name: "Root" },
        [
          [
            { id: "2", parentId: "1", name: "Child 1" },
            [[{ id: "4", parentId: "2", name: "Grandchild" }, []]],
          ],
          [{ id: "3", parentId: "1", name: "Child 2" }, []],
        ],
      ],
    ]);
  });

  it("should build a forest with multiple root nodes", () => {
    const data = [
      { id: "1", parentId: null, name: "Root 1" },
      { id: "2", parentId: null, name: "Root 2" },
      { id: "3", parentId: "1", name: "Child of Root 1" },
      { id: "4", parentId: "2", name: "Child of Root 2" },
    ];
    const tree = buildCategoryTree(data);
    expect(tree).toEqual([
      [
        { id: "1", parentId: null, name: "Root 1" },
        [[{ id: "3", parentId: "1", name: "Child of Root 1" }, []]],
      ],
      [
        { id: "2", parentId: null, name: "Root 2" },
        [[{ id: "4", parentId: "2", name: "Child of Root 2" }, []]],
      ],
    ]);
  });

  it("should handle empty input", () => {
    const data: { id: string; parentId: string | null }[] = [];
    const tree = buildCategoryTree(data);
    expect(tree).toEqual([]);
  });

  // it("should handle nodes with missing parents gracefully", () => {
  //   const data = [{ id: "2", parentId: "1", name: "Orphan" }];
  //   const tree = buildCategoryTree(data);
  //   expect(tree).toEqual([
  //     [
  //       { id: "1", parentId: null },
  //       [[{ id: "2", parentId: "1", name: "Orphan" }, []]],
  //     ],
  //   ]);
  // });
});

describe("computeCategoryAccruals", () => {
  const period = {
    from: new Date("2025-01-01"),
    to: new Date("2025-01-31"),
  };

  it("computes accrual correctly for full overlap", () => {
    const categories = [
      {
        categoryId: "cat-1",
        parentId: null,
        name: "Groceries",
        icon: "🛒",
        budgets: [
          {
            id: "b1",
            amount: 300,
            instanceDate: new Date("2025-01-01"),
            instanceEndDate: new Date("2025-01-31"),
          },
        ],
      },
    ];

    const result = computeCategoryAccruals(categories, period, 1500);
    expect(result[0].accrual).toBeCloseTo(300);
    expect(result[0].incomePercentage).toBeCloseTo(20);
  });

  it("computes accrual correctly for partial overlap", () => {
    const categories = [
      {
        categoryId: "cat-1",
        parentId: null,
        name: "Rent",
        icon: "🏠",
        budgets: [
          {
            id: "b2",
            amount: 600,
            instanceDate: new Date("2024-12-15"),
            instanceEndDate: new Date("2025-01-14"),
          },
        ],
      },
    ];

    const result = computeCategoryAccruals(categories, period, 2000);
    const expectedDays = 14; // Jan 1 to Jan 14 inclusive
    const expectedAccrual = 600 * (expectedDays / 31);

    expect(result[0].accrual).toBeCloseTo(expectedAccrual, 2);
    expect(result[0].incomePercentage).toBeCloseTo(
      (expectedAccrual / 2000) * 100,
      2,
    );
  });

  it("sums children accrual correctly", () => {
    const categories = [
      {
        categoryId: "cat-1",
        parentId: null,
        name: "Utilities",
        icon: "💡",
        budgets: [],
      },
      {
        categoryId: "cat-2",
        parentId: "cat-1",
        name: "Electricity",
        icon: "⚡️",
        budgets: [
          {
            id: "b3",
            amount: 100,
            instanceDate: new Date("2025-01-01"),
            instanceEndDate: new Date("2025-01-31"),
          },
        ],
      },
      {
        categoryId: "cat-3",
        parentId: "cat-1",
        name: "Water",
        icon: "🚿",
        budgets: [
          {
            id: "b4",
            amount: 50,
            instanceDate: new Date("2025-01-15"),
            instanceEndDate: new Date("2025-02-14"),
          },
        ],
      },
    ];

    const result = computeCategoryAccruals(categories, period, 1000);
    const parent = result.find((c) => c.categoryId === "cat-1");

    expect(parent?.accrualOfChildren).toBeCloseTo(
      100 + (50 * 17) / 31, // full electricity + partial water
      2,
    );
  });

  it("returns zero for categories without budget", () => {
    const categories = [
      {
        categoryId: "cat-1",
        parentId: null,
        name: "Misc",
        icon: "🎲",
        budgets: [],
      },
    ];

    const result = computeCategoryAccruals(categories, period, 1000);
    expect(result[0].accrual).toBe(0);
    expect(result[0].incomePercentage).toBe(0);
    expect(result[0].accrualOfChildren).toBe(0);
  });
});
