import "server-only";

import { cache } from "react";
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

export async function findAllPensionFunds() {
  return await db.query.pensionFunds.findMany({
    with: {
      investmentsBranches: true,
    },
  });
}

export const getPensionFunsContributions = cache(
  async (timeframe: DateRange, fundIds: string[]) => {
    const session = auth();

    if (!session?.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const { from, to } = timeframe;

    const result = await db.query.pensionAccounts.findMany({
      where: (pensionAccounts, { and, eq, inArray }) =>
        and(
          fundIds.length > 0
            ? inArray(schema.pensionAccounts.id, fundIds.map(Number))
            : undefined,
          eq(pensionAccounts.userId, session.userId),
        ),
      with: {
        contributions: {
          where: (contributions, { gt, lt, and }) =>
            and(
              gt(contributions.consolidated_at, from),
              lt(contributions.consolidated_at, to),
            ),
        },
      },
    });

    return result;
  },
);
export type PensionFunsContributions = ReturnType<
  typeof getPensionFunsContributions
>;
