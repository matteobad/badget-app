import { describe, expect, test } from "bun:test";

import { tokenize } from "./tokenize";

// beforeAll(() => {
//   // setup tests
// });

describe("tokenize", () => {
  test("should handle snake_case", () => {
    const actual = tokenize("snake_case");
    expect(actual).toEqual(["snake", "case"]);
  });

  test("should handle camelCase", () => {
    const actual = tokenize("camelCase");
    expect(actual).toEqual(["camel", "case"]);
  });

  test("should remove numbers", () => {
    const actual = tokenize("Apple Pay Top Up By 6379");
    expect(actual).toEqual(["apple", "pay", "top", "up"]);
  });

  test("should filter common words", () => {
    const actual = tokenize("To Emergency fund");
    expect(actual).toEqual(["emergency", "fund"]);
  });
});
