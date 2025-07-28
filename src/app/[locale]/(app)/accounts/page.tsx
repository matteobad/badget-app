import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { AccountsSearchFilter } from "~/components/bank-account/accounts-search-filter";
import { DataTable } from "~/components/bank-account/table/data-table";
import { Loading } from "~/components/bank-account/table/loading";
import { AddAccountButton } from "~/components/bank-connection/add-account-button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  getQueryClient,
  HydrateClient,
  trpc,
} from "~/shared/helpers/trpc/server";
import { ErrorBoundary } from "react-error-boundary";

export const metadata: Metadata = {
  title: "Accounts | Badget.",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AccountsPage(_props: PageProps) {
  const queryClient = getQueryClient();

  // const columnVisibility = getInitialTransactionsColumnVisibility();

  // Change this to prefetch once this is fixed: https://github.com/trpc/trpc/issues/6632
  await queryClient.fetchQuery(trpc.bankAccount.get.queryOptions({}));

  return (
    <HydrateClient>
      <Card className="mx-6 mt-6">
        <CardHeader className="flex flex-row justify-between gap-4 p-4">
          <AccountsSearchFilter />
          <AddAccountButton />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <Suspense fallback={<Loading />}>
              <DataTable />
            </Suspense>
          </ErrorBoundary>
        </CardContent>
      </Card>
    </HydrateClient>
  );
}
