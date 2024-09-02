import { describe, expect, test } from "bun:test";

import type { UserRule } from "./categorize";
import { categorize } from "./categorize";

const rules: UserRule[] = [
  {
    id: 1,
    name: "shopping",
    keywords: new Map<string, number>([
      ["shopping", 1],
      ["zara", 2],
      ["common", 1],
    ]),
  },
  {
    id: 2,
    name: "transportation",
    keywords: new Map<string, number>([
      ["benzina", 1],
      ["auto", 1],
      ["common", 1],
    ]),
  },
];

describe("categorize", () => {
  test("should be null when no rules match", () => {
    const actual = categorize(
      {
        amount: "-10,00",
        description: "description",
      },
      [],
    );
    expect(actual).toBeNull();
  });

  test("should categorize when one keyword match a rule", () => {
    const actual = categorize(
      {
        amount: "10,00",
        description: "shopping",
      },
      rules,
    );
    expect(actual).toBe(1);
  });

  test("should categorize with highest relavance when more rules match", () => {
    const actual = categorize(
      {
        amount: "10,00",
        description: "common auto",
      },
      rules,
    );
    expect(actual).toBe(2);
  });
});
