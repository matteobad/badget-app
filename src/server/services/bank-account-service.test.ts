import { expect, it } from "bun:test";

import { db } from "../db";
import { createManualBankAccount } from "./bank-account-service";

it("should create manual account with opening balance at t0", async () => {
  const organizationId = crypto.randomUUID();

  const actual = await createManualBankAccount(
    db,
    {
      balance: 100,
      currency: "EUR",
      name: "Name",
    },
    organizationId,
  );

  expect(actual).toBeDefined();
  expect(actual.openingBalance).toEqual(100);
  expect(actual.t0Datetime?.split("T")[0]).toEqual(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    new Date().toISOString().split("T")[0]!,
  );
});
