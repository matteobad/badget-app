import { unstable_cache } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import type { GetUserBankAccountsParams } from ".";
import { db, schema } from "~/server/db";
import { getUserBankAccountsQuery } from ".";

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
