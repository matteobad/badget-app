import { describe, expect, test } from "bun:test";
import getUUID from "uuid-by-string";

import type { UserRule } from "./categorize";
import { categorize } from "./categorize";

// beforeAll(() => {
//   // setup tests
// });

const userId = "userId";
const incomeUUID = getUUID(`income_${userId}`);
const outcomeUUID = getUUID(`outcome_${userId}`);

const rules: UserRule[] = [
  {
    id: "shoppingId",
    name: "shopping",
    keywords: new Map<string, number>([
      ["shopping", 1],
      ["zara", 2],
      ["common", 1],
    ]),
  },
  {
    id: "transportationId",
    name: "transportation",
    keywords: new Map<string, number>([
      ["benzina", 1],
      ["auto", 1],
      ["common", 1],
    ]),
  },
];

describe("categorize", () => {
  test("should be income when no rules and positive amount", () => {
    const actual = categorize(
      {
        amount: "-10,00",
        description: "description",
      },
      [],
      userId,
    );
    expect(actual).toBe(outcomeUUID);
  });

  test("should be outcome when no rules and negative amount", () => {
    const actual = categorize(
      {
        amount: "10,00",
        description: "description",
      },
      [],
      userId,
    );
    expect(actual).toBe(incomeUUID);
  });

  test("should be incobe when no keyword match a rule", () => {
    const actual = categorize(
      {
        amount: "10,00",
        description: "no match",
      },
      rules,
      userId,
    );
    expect(actual).toBe(incomeUUID);
  });

  test("should categorize when one keyword match a rule", () => {
    const actual = categorize(
      {
        amount: "10,00",
        description: "shopping",
      },
      rules,
      userId,
    );
    expect(actual).toBe("shoppingId");
  });

  test("should categorize with highest relavance when more rules match", () => {
    const actual = categorize(
      {
        amount: "10,00",
        description: "common auto",
      },
      rules,
      userId,
    );
    expect(actual).toBe("transportationId");
  });
});
