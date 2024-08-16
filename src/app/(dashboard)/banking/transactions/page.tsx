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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AddTransactionButton } from "./_components/add-transaction-button";
import { TransactionsTableLoading } from "./_components/transactions-table.loading";
import { TransactionsTableServer } from "./_components/transactions-table.server";

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
      <CardHeader className="flex flex-row justify-between gap-6">
        <div className="flex flex-col space-y-1.5">
          <CardTitle>Transazioni</CardTitle>
          <CardDescription>
            Manage bank transactions, update or add new ones.
          </CardDescription>
        </div>
        <AddTransactionButton />
      </CardHeader>
      <CardContent className="space-y-2">
        <ErrorBoundary errorComponent={ErrorFallback}>
          <Suspense fallback={<TransactionsTableLoading />} key={loadingKey}>
            <TransactionsTableServer />
          </Suspense>
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
}
