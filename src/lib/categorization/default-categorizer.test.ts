import { describe, expect, test } from "bun:test";

import { type Transaction } from "~/server/db";
import { categorize } from "./default-categorizer";

const mockTransaction: Transaction = {
  userId: "userId",
};

describe("categorize", () => {
  test("should match 'transfers' when amount is null", () => {
    const actual = categorize(mockTransaction);
    expect(actual).toBe("transfers");
  });

  test("should match 'transfers' when amount is '0'", () => {
    const actual = categorize({ ...mockTransaction, amount: "0" });
    expect(actual).toBe("transfers");
  });

  test("should match 'income' when amount is > 0", () => {
    const actual = categorize({ ...mockTransaction, amount: "1" });
    expect(actual).toBe("income");
  });

  test("should match 'income' when amount is < 0", () => {
    const actual = categorize({ ...mockTransaction, amount: "-1" });
    expect(actual).toBe("uncategorized");
  });
});
