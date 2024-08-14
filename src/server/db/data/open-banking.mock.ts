import type { InferInsertModel } from "drizzle-orm";

import type { schema } from "..";
import { Provider } from "../schema/enum";

export const institutionsMock = [
  {
    id: "1",
    createdAt: new Date(2024, 1, 1),
    updatedAt: new Date(2024, 1, 1),

    name: "Revolut",
    provider: Provider.GOCARDLESS,
  },
] satisfies InferInsertModel<typeof schema.institutions>[];

export const accountsMock = [
  {
    id: 1,
    createdAt: new Date(2024, 1, 1),
    updatedAt: new Date(2024, 1, 1),

    name: "Revolut",
    institutionId: "1",
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
] satisfies InferInsertModel<typeof schema.bankAccounts>[];

export const balancesMock = [
  {
    id: 1,
    createdAt: new Date(2024, 1, 1),
    updatedAt: new Date(2024, 1, 1),

    bankAccountId: 1,
    amount: 1000,
    currency: "EUR",
  },
] satisfies InferInsertModel<typeof schema.bankAccountBalances>[];
