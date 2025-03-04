import { unstable_cache } from "next/cache";

import {
  getBankingKPI_QUERY,
  getDebtKPI_QUERY,
  getGoalKPI_QUERY,
  getInvestmentKPI_QUERY,
  getSavingKPI_QUERY,
} from "./queries";

export const getBankingKPI_CACHED = (userId: string) => {
  const cacheKeys = ["account", `account_${userId}`];
  return unstable_cache(
    async () => {
      const result = await Promise.all([
        getBankingKPI_QUERY(userId),
        getSavingKPI_QUERY(userId),
        getGoalKPI_QUERY(userId),
        getInvestmentKPI_QUERY(userId),
        getDebtKPI_QUERY(userId),
      ]);

      return {
        banking: result[0].total ?? 0,
        emergency: result[1].total ?? 0,
        goal: result[2].total ?? 0,
        investment: result[3].total ?? 0,
        debt: result[4].total ?? 0,
      };
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};
