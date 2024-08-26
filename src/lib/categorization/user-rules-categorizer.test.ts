import { describe, expect, test } from "bun:test";

import type { UserRule } from "./user-rules-categorizer";
import { type Transaction } from "~/server/db";
import { categorize } from "./user-rules-categorizer";

const mockTransaction: Transaction = {
  userId: "userId",
};

const defaultRules: UserRule[] = [
  {
    category: "transfers",
    keywords: { transfers: 1 },
  },
  {
    category: "income",
    keywords: { income: 1 },
  },
  {
    category: "uncategorized",
    keywords: { outcome: 1 },
  },
];

describe("categorize", () => {
  test("should match when description is contained in rule's keywords", () => {
    const t = { ...mockTransaction, description: "salary income" };
    const actual = categorize(t, defaultRules);
    expect(actual).toBe("income");
  });

  test("should not match when description is not contained in rule's keywords", () => {
    const t = { ...mockTransaction, description: "pippo" };
    const actual = categorize(t, defaultRules);
    expect(actual).toBeNull();
  });
});
