import { unstable_cache } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import type { GetTransactionsParams, GetUserBankAccountsParams } from ".";
import { db, schema } from "~/server/db";
import { getTransactionsQuery, getUserBankAccountsQuery } from ".";

export async function findAllInstitutions() {
  return unstable_cache(
    async () => {
      return await db.select().from(schema.institutions);
    },
    ["institutions"],
    {
      tags: ["institutions"],
      revalidate: 3600,
    },
  )();
}

export type GetPensionAccountsReturnType = ReturnType<
  typeof findAllInstitutions
>;

export const getUserBankAccounts = async (
  params?: Omit<GetUserBankAccountsParams, "userId">,
) => {
  const session = auth();

  if (!session.userId) {
    return [];
  }

  return unstable_cache(
    async () => {
      return getUserBankAccountsQuery({ ...params, userId: session.userId });
    },
    ["bank_accounts", session.userId],
    {
      tags: [`bank_accounts_${session.userId}`],
      revalidate: 180,
    },
  )();
};

export const getUserTransactions = async (
  params: Omit<GetTransactionsParams, "userId">,
) => {
  const session = auth();

  if (!session.userId) {
    return [];
  }

  return unstable_cache(
    async () => {
      return getTransactionsQuery({ ...params, userId: session.userId });
    },
    ["transactions", session.userId],
    {
      revalidate: 180,
      tags: [`transactions_${session.userId}`],
    },
  )();
};
