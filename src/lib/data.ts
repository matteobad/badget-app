import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db, schema } from "~/server/db";
import { type DateRange } from "./validators";

// fetch data here with cache
export async function getPensionAccountsByUserId() {
  const session = auth();

  if (!session?.userId) {
    throw new Error("UNAUTHORIZED");
  }

  return await db
    .select()
    .from(schema.pensionAccounts)
    .where(eq(schema.pensionAccounts.userId, session.userId));
}
export type GetPensionAccountsReturnType = ReturnType<
  typeof getPensionAccountsByUserId
>;

export async function findAllPensionFunds() {
  return await db.query.pensionFunds.findMany({
    with: {
      investmentsBranches: true,
    },
  });
}

export const getPensionFunsContributions = cache(
  async (_timeframe: DateRange, fundIds: string[]) => {
    const session = auth();

    if (!session?.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const result = await db.query.pensionAccounts.findMany({
      where: (pensionAccounts, { and, eq, inArray }) =>
        and(
          fundIds.length > 0
            ? inArray(schema.pensionAccounts.id, fundIds.map(Number))
            : undefined,
          eq(pensionAccounts.userId, session.userId),
        ),
      with: {
        contributions: true,
      },
    });

    return result;
  },
);
export type PensionFunsContributions = ReturnType<
  typeof getPensionFunsContributions
>;

export const getPensionAccountTotal = unstable_cache(
  async (timeframe: DateRange, fundIds: string[]) => {
    const contributions = await getPensionFunsContributions(timeframe, fundIds);

    const result = contributions.reduce((tot, value) => {
      tot += value.contributions.reduce(
        (acc, item) => (acc += parseFloat(item.amount!)),
        0,
      );
      return tot;
    }, 0);

    return { value: result };
  },
  [""], // TODO: cache keys
);

export const getRecentContributions = unstable_cache(async () => {
  const session = auth();

  if (!session?.userId) {
    throw new Error("UNAUTHORIZED");
  }

  const result = await db.query.pensionAccounts.findMany({
    where: (pensionAccounts, { eq }) =>
      eq(pensionAccounts.userId, session.userId),
    with: {
      contributions: true,
    },
  });

  return result;
});
