import { Suspense } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

import { ErrorFallback } from "~/components/error-fallback";
import { TransactionsTableServer } from "~/components/tables/transactions-table";
import { TransactionsTableLoading } from "~/components/tables/trasactions-table.loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

const searchParamsCache = createSearchParamsCache({
  q: parseAsString,
  page: parseAsInteger.withDefault(0),
  attachments: parseAsStringLiteral(["exclude", "include"] as const),
  start: parseAsString,
  end: parseAsString,
  categories: parseAsArrayOf(parseAsString),
  accounts: parseAsArrayOf(parseAsString),
  assignees: parseAsArrayOf(parseAsString),
  statuses: parseAsStringLiteral([
    "fullfilled",
    "unfulfilled",
    "excluded",
  ] as const),
});

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { q: query, page } = searchParamsCache.parse(searchParams);

  // Move this in a suspense

  const loadingKey = JSON.stringify({
    page,
    query,
  });

  return (
    <Card className="h-fit w-full">
      <CardHeader>
        <CardTitle>Transazioni</CardTitle>
        <CardDescription>
          Manage bank transactions, update or add new ones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between py-6">
          {/* <TransactionsSearchFilter
            placeholder="Search or type filter"
            validFilters={VALID_FILTERS}
            categories={categoriesData?.data?.map((category) => ({
              slug: category.slug,
              name: category.name,
            }))}
            accounts={accountsData?.data?.map((account) => ({
              id: account.id,
              name: account.name,
              currency: account.currency,
            }))}
          />
          <TransactionsActions isEmpty={isEmpty} /> */}
        </div>
        <ErrorBoundary errorComponent={ErrorFallback}>
          <Suspense fallback={<TransactionsTableLoading />} key={loadingKey}>
            <TransactionsTableServer />
          </Suspense>
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
}
