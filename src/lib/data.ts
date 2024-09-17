import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { type z } from "zod";

import type {
  DateRange,
  getPendingBankConnectionsParamsSchema,
} from "./validators";
import { getAccounts } from "~/server/actions/institutions/get-accounts";
import { db, schema } from "~/server/db";
import { Provider } from "~/server/db/schema/enum";
import {
  transformAccount,
  transformConnection,
} from "~/server/providers/gocardless/transform";

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

export const getPendingBankConnections = async (
  params: z.infer<typeof getPendingBankConnectionsParamsSchema>,
) => {
  const session = auth();

  if (!session?.userId) {
    throw new Error("UNAUTHORIZED");
  }

  return unstable_cache(
    async () => {
      const data: {
        connection: typeof schema.bankConnections.$inferInsert;
        accounts: (typeof schema.bankAccounts.$inferInsert)[];
      }[] = [];

      for (const id of params.ref ?? []) {
        const accounts = await getAccounts({ id });
        if (!accounts[0]?.account || !accounts[0]?.institution) continue;

        data.push({
          connection: {
            ...transformConnection({ ...accounts[0], id }),
            userId: session.userId,
          },
          accounts: accounts.map(transformAccount).map((account) => ({
            ...account,
            userId: session.userId,
          })),
        });
      }

      const manualConnection = await db.query.bankConnections.findMany({
        where: (bankConnections, { eq }) =>
          eq(bankConnections.userId, session.userId) &&
          eq(bankConnections.provider, Provider.NONE),
        with: {
          bankAccount: true,
        },
      });

      if (manualConnection.length > 0) {
        data.push({
          connection: {
            ...manualConnection[0]!,
          },
          accounts: manualConnection[0]!.bankAccount.map((account) => ({
            ...account,
            balance: account.balance?.toString() ?? "0",
            userId: session.userId,
          })),
        });
      }

      return data;
    },
    [`ref_${params.ref?.join(".")}`],
    { tags: [`ref_${params.ref?.join(".")}`], revalidate: 60 * 60 * 24 * 7 },
  )();
};
