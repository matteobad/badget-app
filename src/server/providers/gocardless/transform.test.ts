import { describe, expect, test } from "bun:test";

import { transformTransactionName } from "./transform";
import { type GocardlessTransaction } from "./types";

describe("transformTransactionName", () => {
  test("should parse N26 online payment", () => {
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
    expect(actual).toBe("Microsoft Store");
  });

  test("should parse N26 moneybean out", () => {
    const n26_transaction = {
      transactionId: "da1ff5a8-c8fe-11ee-a1b7-cd10582d99f8",
      bookingDate: "2024-02-11",
      valueDate: "2024-02-11",
      transactionAmount: {
        amount: "-40.00",
        currency: "EUR",
      },
      creditorName: "Mattia Ferrari",
      remittanceInformationUnstructured: "Cena",
      remittanceInformationUnstructuredArray: ["Cena"],
      bankTransactionCode: "PMNT-ICDT-BOOK",
      internalTransactionId: "c389a4c960866bce166f9d16726ebbae",
    } satisfies GocardlessTransaction;

    const actual = transformTransactionName(n26_transaction);
    expect(actual).toBe("Mattia Ferrari - Cena");
  });

  test("should parse N26 bank transfer in", () => {
    const n26_transaction = {
      transactionId: "b0a648ea-c8fe-11ee-8784-f9c12b8859ac",
      bookingDate: "2024-02-11",
      valueDate: "2024-02-11",
      transactionAmount: {
        amount: "40.00",
        currency: "EUR",
      },
      debtorName: "Matteo Badini",
      debtorAccount: {
        iban: "LT943250084589357433",
      },
      remittanceInformationUnstructured: "Sent from Revolut",
      remittanceInformationUnstructuredArray: ["Sent from Revolut"],
      additionalInformation: "139d87fa-2910-4aa3-a6c1-c6aad9ea0030",
      bankTransactionCode: "PMNT-RCDT-ESCT",
      internalTransactionId: "dda36f3ab2e32c3716a0e32c4c46fc09",
    } satisfies GocardlessTransaction;

    const actual = transformTransactionName(n26_transaction);
    expect(actual).toBe("Matteo Badini - Sent From Revolut");
  });

  test("should parse N26 card payment", () => {
    const n26_transaction = {
      transactionId: "10ef4857-eb88-11ed-9c12-7d081a543276",
      bookingDate: "2023-05-05",
      valueDate: "2023-05-05",
      transactionAmount: {
        amount: "-15.70",
        currency: "EUR",
      },
      creditorName: "A CASA MIA",
      additionalInformation: "1bc60ef5-13aa-4eba-9d41-9433e4c7ddd8",
      bankTransactionCode: "PMNT-CCRD-POSD",
      internalTransactionId: "22aac884b7d39d61b18b2c2f51a6f449",
    } satisfies GocardlessTransaction;

    const actual = transformTransactionName(n26_transaction);
    expect(actual).toBe("A Casa Mia");
  });

  test("should parse N26 account fees", () => {
    const n26_transaction = {
      transactionId: "ec3cc2cf-12f0-11ee-a17f-17e209443383",
      bookingDate: "2023-06-25",
      valueDate: "2023-06-25",
      transactionAmount: {
        amount: "50.00",
        currency: "EUR",
      },
      remittanceInformationUnstructured:
        "Hai trasferito denaro con successo dalla tua carta *8032.",
      remittanceInformationUnstructuredArray: [
        "Hai trasferito denaro con successo dalla tua carta *8032.",
      ],
      additionalInformation: "bd786464-f0ab-43db-9580-b9584c22aa00",
      bankTransactionCode: "PMNT-RCDT-ESCT",
      internalTransactionId: "15b8ef509b5c49c61e7eac07f6ced33f",
    } satisfies GocardlessTransaction;

    const actual = transformTransactionName(n26_transaction);
    expect(actual).toBe(
      "Hai Trasferito Denaro Con Successo Dalla Tua Carta 8032",
    );
  });
});
