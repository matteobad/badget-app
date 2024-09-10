import { unstable_cache, unstable_noStore } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { type z } from "zod";

import type { GetTransactionsParams, GetUserBankAccountsParams } from ".";
import {
  type accountsSearchParamsSchema,
  type getPendingBankConnectionsParamsSchema,
  type institutionsSearchParamsSchema,
  type transactionsSearchParamsSchema,
} from "~/lib/validators";
import { db, schema } from "~/server/db";
import {
  getCategoriesQuery,
  getCategoryBudgetsQuery,
  getCategoryRulesQuery,
  getFilteredAccoountsQuery,
  getFilteredInstitutionsQuery,
  getFilteredTransactionsQuery,
  getPendingBankConnectionsQuery,
  getSpendingByCategoryQuery,
  getSpendingByCategoryTypeQuery,
  getTransactionsQuery,
  getUserBankAccountsQuery,
  getUserBankConnectionsQuery,
} from ".";
import { type CategoryType } from "../schema/enum";

export async function getFilteredInstitutions(
  params: z.infer<typeof institutionsSearchParamsSchema>,
) {
  unstable_noStore();

  return await getFilteredInstitutionsQuery({ params });
}

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

export const getPendingBankConnections = async (
  params: z.infer<typeof getPendingBankConnectionsParamsSchema>,
) => {
  const session = auth();

  if (!session.userId) {
    return [];
  }

  unstable_noStore();
  return await getPendingBankConnectionsQuery(params, session.userId);
};

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

export const getFilteredAccounts = async (
  params: z.infer<typeof accountsSearchParamsSchema>,
) => {
  const session = auth();

  if (!session.userId) {
    return [];
  }

  unstable_noStore();
  return getFilteredAccoountsQuery({ params, userId: session.userId });
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

export const getUserCategoryBudgets = async (
  params: Omit<GetTransactionsParams, "userId">,
) => {
  const session = auth();

  if (!session.userId) {
    return [];
  }

  return unstable_cache(
    async () => {
      return getCategoryBudgetsQuery({ ...params, userId: session.userId });
    },
    ["transactions", session.userId],
    {
      revalidate: 180,
      tags: [`transactions_${session.userId}`],
    },
  )();
};

export const getUserCategoryRules = async (
  params: Omit<GetTransactionsParams, "userId">,
) => {
  const session = auth();

  if (!session.userId) {
    return [];
  }

  return unstable_cache(
    async () => {
      return getCategoryRulesQuery({ ...params, userId: session.userId });
    },
    ["category_rules_", session.userId],
    {
      revalidate: 180,
      tags: [`category_rules_${session.userId}`],
    },
  )();
};

export const getSpendingByCategoryType = async (params: {
  from: Date;
  to: Date;
  type: CategoryType;
}) => {
  const session = auth();

  if (!session.userId) {
    return {
      actual: 0,
      budget: 0,
    };
  }

  unstable_noStore();
  return getSpendingByCategoryTypeQuery({
    ...params,
    userId: session.userId,
  });
};

export const getSpendingByCategory = async (params: {
  from: Date;
  to: Date;
}) => {
  const session = auth();

  if (!session.userId) {
    return [
      {
        category: "",
        actual: 0,
        budget: 0,
      },
    ];
  }

  unstable_noStore();
  return getSpendingByCategoryQuery({
    ...params,
    userId: session.userId,
  });
};
