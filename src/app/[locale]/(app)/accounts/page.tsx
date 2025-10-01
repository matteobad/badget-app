import type { Metadata } from "next";
import { Suspense } from "react";
import { AssetsAccordion } from "~/components/assets-liabilities/assets-accordion";
import { EditGroupsProvider } from "~/components/assets-liabilities/edit-groups-context";
import { MainActions } from "~/components/assets-liabilities/main-actions";
import { AccountsSearchFilter } from "~/components/bank-account/accounts-search-filter";
import { Loading } from "~/components/bank-account/table/loading";
import { ErrorFallback } from "~/components/error-fallback";
import { HydrateClient, prefetch, trpc } from "~/shared/helpers/trpc/server";
import { ErrorBoundary } from "react-error-boundary";

export const metadata: Metadata = {
  title: "Accounts | Badget.",
};

export default async function AccountsPage() {
  prefetch(trpc.preferences.listAccountGroups.queryOptions());

  return (
    <HydrateClient>
      <EditGroupsProvider>
        <div className="flex flex-col gap-4 py-6">
          <div className="flex items-center justify-between">
            <AccountsSearchFilter />
            <MainActions />
          </div>
          <ErrorBoundary fallback={<ErrorFallback />}>
            <Suspense fallback={<Loading />}>
              <AssetsAccordion />
            </Suspense>
          </ErrorBoundary>
        </div>
      </EditGroupsProvider>
    </HydrateClient>
  );
}
