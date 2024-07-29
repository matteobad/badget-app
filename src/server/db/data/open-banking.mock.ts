import type { InferInsertModel } from "drizzle-orm";

import type { schema } from "..";

export const institutionsMock = [
  {
    id: 1,
    createdAt: new Date(2024, 1, 1),
    updatedAt: new Date(2024, 1, 1),

    name: "Revolut",
    bic: "BICXXX",
  },
] satisfies InferInsertModel<typeof schema.institutions>[];

export const accountsMock = [
  {
    id: 1,
    createdAt: new Date(2024, 1, 1),
    updatedAt: new Date(2024, 1, 1),

    name: "Revolut",
    expires: new Date(2024, 12, 31),
    institutionId: 1,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
] satisfies InferInsertModel<typeof schema.accounts>[];

export const balancesMock = [
  {
    id: 1,
    createdAt: new Date(2024, 1, 1),
    updatedAt: new Date(2024, 1, 1),

    accountId: 1,
    amount: "1000",
    currency: "EUR",
  },
] satisfies InferInsertModel<typeof schema.balances>[];
