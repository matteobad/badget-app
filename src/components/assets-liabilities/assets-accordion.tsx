"use client";

import { useQuery } from "@tanstack/react-query";
import { useBankAccountFilterParams } from "~/hooks/use-bank-account-filter-params";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { DataTable } from "../bank-account/table/data-table";
import { NoAccounts, NoResults } from "../bank-account/table/empty-states";
import { Loading } from "../bank-account/table/loading";

export function AssetsAccordion() {
  const { filters, hasFilters } = useBankAccountFilterParams();

  const trpc = useTRPC();

  const { data: accounts, isSuccess } = useQuery(
    trpc.asset.get.queryOptions({
      q: filters.q,
    }),
  );

  if (!accounts?.length && isSuccess && !hasFilters) {
    return (
      <div className="absolute inset-0 h-screen overflow-hidden p-6">
        <NoAccounts />
        <Loading isEmpty />
      </div>
    );
  }

  if (!accounts?.length && isSuccess && hasFilters) {
    return (
      <div className="relative h-[300px] overflow-hidden p-6">
        <NoResults />
      </div>
    );
  }

  return <DataTable data={accounts ?? []} />;
}
