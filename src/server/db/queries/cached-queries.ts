import { unstable_cache, unstable_noStore } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { type z } from "zod";

import type { GetTransactionsParams, GetUserBankAccountsParams } from ".";
import { type transactionsSearchParamsSchema } from "~/lib/validators";
import { db, schema } from "~/server/db";
import {
  getBankOverviewChartQuery,
  getCategoriesQuery,
  getFilteredTransactionsQuery,
  getTransactionsQuery,
  getUserBankAccountsQuery,
  getUserBankConnectionsQuery,
} from ".";

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

export const getUserBankConnections = async (
  params?: Omit<GetUserBankAccountsParams, "userId">,
) => {
  const session = auth();

  if (!session.userId) {
    return [];
  }

  return unstable_cache(
    async () => {
      return getUserBankConnectionsQuery({ ...params, userId: session.userId });
    },
    ["bank_connections", session.userId],
    {
      tags: [`bank_connections_${session.userId}`],
      revalidate: 180,
    },
  )();
};
export type BankAccount = Awaited<
  ReturnType<typeof getUserBankConnections>
>[number];

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

export const getFilteredTransactions = async (
  params: z.infer<typeof transactionsSearchParamsSchema>,
) => {
  const session = auth();

  if (!session.userId) {
    return {
      data: [],
      pageCount: 0,
    };
  }

  unstable_noStore();
  return getFilteredTransactionsQuery({ params, userId: session.userId });
};

export const getUserCategories = async (
  params: Omit<GetTransactionsParams, "userId">,
) => {
  const session = auth();

  if (!session.userId) {
    return [];
  }

  return unstable_cache(
    async () => {
      return getCategoriesQuery({ ...params, userId: session.userId });
    },
    ["bank_categories_", session.userId],
    {
      revalidate: 180,
      tags: [`bank_categories_${session.userId}`],
    },
  )();
};

export const getBankOverviewChart = async (
  params: Omit<GetTransactionsParams, "userId">,
) => {
  const session = auth();

  if (!session.userId) {
    return [];
  }

  return unstable_cache(
    async () => {
      return getBankOverviewChartQuery({ ...params, userId: session.userId });
    },
    ["bank_overview_", session.userId],
    {
      revalidate: 180,
      tags: [`bank_overview_${session.userId}`],
    },
  )();
};
