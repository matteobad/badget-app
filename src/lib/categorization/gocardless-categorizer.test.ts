import { describe, expect, test } from "bun:test";

import { type GocardlessTransaction } from "~/server/providers/gocardless/types";
import { categorizeGocardless } from "./gocardless-categorizer";

const mockTransaction: GocardlessTransaction = {
  bookingDate: "",
  internalTransactionId: "",
  transactionAmount: {
    amount: "0",
    currency: "EUR",
  },
};

describe("categorizeGocardless", () => {
  test("should not match if no proprietaryBankTransactionCode", () => {
    const actual = categorizeGocardless(mockTransaction);
    expect(actual).toBeNull();
  });

  test("should not match when proprietaryBankTransactionCode is an unknown keyword", () => {
    const actual = categorizeGocardless({
      ...mockTransaction,
      proprietaryBankTransactionCode: "unknown",
    });
    expect(actual).toBeNull();
  });

  test("should match when proprietaryBankTransactionCode is a known keyword", () => {
    const actual = categorizeGocardless({
      ...mockTransaction,
      proprietaryBankTransactionCode: "transfer",
    });
    expect(actual).toBe("transfers");
  });

  test("should match when proprietaryBankTransactionCode is a known keyword with different casing", () => {
    const actual = categorizeGocardless({
      ...mockTransaction,
      proprietaryBankTransactionCode: "Transfer",
    });
    expect(actual).toBe("transfers");
  });
});
