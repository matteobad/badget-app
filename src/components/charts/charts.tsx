"use client";

import { useQuery } from "@tanstack/react-query";
import { useMetricsParams } from "~/hooks/use-metrics-params";
import { useTRPC } from "~/shared/helpers/trpc/client";

// import { BurnRateChart } from "./burn-rate-chart";
import { ExpenseChart } from "./expense-chart";
import { NetWorthChart } from "./net-worth-chart";

// import { ProfitChart } from "./profit-chart";
// import { RevenueChart } from "./revenue-chart";

export function Charts() {
  const { params } = useMetricsParams();
  const trpc = useTRPC();

  const { data: accounts } = useQuery(
    trpc.bankAccount.get.queryOptions({
      enabled: true,
    }),
  );

  // If the user has not connected any accounts, disable the charts
  const disabled = !accounts?.length;

  switch (params.chart) {
    case "net_worth":
      return <NetWorthChart disabled={disabled} />;
    case "expense":
      return <ExpenseChart disabled={disabled} />;
    default:
      return null;
  }
}
