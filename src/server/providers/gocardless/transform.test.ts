import { describe, expect, test } from "bun:test";

import { transformTransactionName } from "./transform";
import { type GocardlessTransaction } from "./types";

describe("transformTransactionName", () => {
  test("should parse transaction with only debtorName", () => {
    const n26_transaction = {
      transactionId: "9cf946b9-0b86-11ef-ac25-0f5110808b6a",
      bookingDate: "2024-05-06",
      valueDate: "2024-05-06",
      transactionAmount: {
        amount: "1.01",
        currency: "EUR",
      },
      debtorName: "Microsoft*Store",
      additionalInformation: "155b13a5-88ee-3aed-85cf-c8bae90a00d1",
      bankTransactionCode: "PMNT-MCRD-DAJT",
      internalTransactionId: "83d4169ca1d61f77eb2d7141c298222c",
    } satisfies GocardlessTransaction;

    const actual = transformTransactionName(n26_transaction);
    expect(actual).toBe("Microsoft*Store");
  });
});
