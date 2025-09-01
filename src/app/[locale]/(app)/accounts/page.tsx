import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { AssetsAccordion } from "~/components/assets-liabilities/assets-accordion";
import { AssetsCard } from "~/components/assets-liabilities/assets-card";
import { LiabilitiesCard } from "~/components/assets-liabilities/liabilities-card";
import { NetWorthCard } from "~/components/assets-liabilities/net-worth-card";
import { AccountsSearchFilter } from "~/components/bank-account/accounts-search-filter";
import { Loading } from "~/components/bank-account/table/loading";
import { AddAccountButton } from "~/components/bank-connection/add-account-button";
import { ErrorFallback } from "~/components/error-fallback";
import { HydrateClient, prefetch, trpc } from "~/shared/helpers/trpc/server";
import { ErrorBoundary } from "react-error-boundary";

export const metadata: Metadata = {
  title: "Assets & Liabilities | Badget.",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AssetsLiabilitiesPage(_props: PageProps) {
  prefetch(trpc.asset.get.queryOptions());

  return (
    <HydrateClient>
      <div className="grid gap-6 p-6 pb-4 lg:grid-cols-3">
        <NetWorthCard />
        <AssetsCard />
        <LiabilitiesCard />
      </div>
      <div className="flex flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <AccountsSearchFilter />
          <AddAccountButton />
        </div>
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Suspense fallback={<Loading />}>
            <AssetsAccordion />
          </Suspense>
        </ErrorBoundary>
      </div>
    </HydrateClient>
  );
}
