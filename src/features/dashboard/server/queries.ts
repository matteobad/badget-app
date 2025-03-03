"server-only";

import { and, eq, inArray, sum } from "drizzle-orm";

import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { AccountType } from "~/server/db/schema/enum";

const standardAccountType = [
  AccountType.CASH,
  AccountType.CHECKING,
  AccountType.OTHER,
];
const savingAccountType = [AccountType.SAVINGS];
const investmentAccountType = [AccountType.INVESTMENTS];
const debtAccountType = [AccountType.DEBT];

export const getBankingKPI_QUERY = async (userId: string) => {
  const data = await db
    .select({
      total: sum(account_table.balance).mapWith(Number),
    })
    .from(account_table)
    .where(
      and(
        eq(account_table.userId, userId),
        inArray(account_table.type, standardAccountType),
      ),
    )
    .then((res) => res[0] ?? { total: 0 });

  return data;
};

export const getSavingKPI_QUERY = async (userId: string) => {
  const data = await db
    .select({
      total: sum(account_table.balance).mapWith(Number),
    })
    .from(account_table)
    .where(
      and(
        eq(account_table.userId, userId),
        inArray(account_table.type, savingAccountType),
      ),
    )
    .then((res) => res[0] ?? { total: 0 });

  return data;
};

export const getGoalKPI_QUERY = async (_userId: string) => {
  // TODO: implement goal feature

  return { total: 0 };
};

export const getInvestmentKPI_QUERY = async (userId: string) => {
  const data = await db
    .select({
      total: sum(account_table.balance).mapWith(Number),
    })
    .from(account_table)
    .where(
      and(
        eq(account_table.userId, userId),
        inArray(account_table.type, investmentAccountType),
      ),
    )
    .then((res) => res[0] ?? { total: 0 });

  return data;
};

export const getDebtKPI_QUERY = async (userId: string) => {
  const data = await db
    .select({
      total: sum(account_table.balance).mapWith(Number),
    })
    .from(account_table)
    .where(
      and(
        eq(account_table.userId, userId),
        inArray(account_table.type, debtAccountType),
      ),
    )
    .then((res) => res[0] ?? { total: 0 });

  return data;
};
