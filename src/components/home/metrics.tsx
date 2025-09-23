"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";

export function Metrics() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.metrics.hero.queryOptions());

  function formatNumber(num: number): string {
    if (num >= 1_000_000) {
      // Show one decimal if needed, e.g. 2.5M
      const millions = num / 1_000_000;
      // Remove trailing .0 for whole numbers
      return `${parseFloat(millions.toFixed(1))}M`;
    } else if (num >= 100_000) {
      // Show one decimal if needed, e.g. 2.5M
      const value = num / 100_000;
      // Remove trailing .0 for whole numbers
      return `${parseFloat(value.toFixed(1))}K`;
    }
    return new Intl.NumberFormat().format(num);
  }

  return (
    <div className="bottom-0 left-0 mt-20 grid grid-cols-2 gap-8 md:flex md:flex-nowrap md:divide-x lg:absolute lg:mt-0">
      <div className="flex flex-col text-center md:pr-8">
        <h4 className="mb-4 text-sm text-[#878787]">Users</h4>
        <span className="text-stroke font-mono text-2xl">
          {formatNumber(data?.users ?? 0)}
        </span>
      </div>
      <div className="flex flex-col text-center md:px-8">
        <h4 className="mb-4 text-sm text-[#878787]">Bank accounts</h4>
        <span className="text-stroke font-mono text-2xl">
          {formatNumber(data?.accounts ?? 0)}
        </span>
      </div>
      <div className="flex flex-col text-center md:px-8">
        <h4 className="mb-4 text-sm text-[#878787]">Transactions</h4>
        <span className="text-stroke font-mono text-2xl">
          {formatNumber(data?.transactions ?? 0)}
        </span>
      </div>
      <div className="flex flex-col text-center md:px-8">
        <h4 className="mb-4 text-sm text-[#878787]">Transaction value</h4>
        <span className="text-stroke font-mono text-2xl">
          €{formatNumber(data?.transactionsValue ?? 0)}
        </span>
      </div>
    </div>
  );
}
