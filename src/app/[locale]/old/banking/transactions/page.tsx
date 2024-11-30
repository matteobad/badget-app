import { Suspense } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { type z } from "zod";

import { ErrorFallback } from "~/components/error-fallback";
import { transactionsSearchParamsSchema } from "~/lib/validators";
import { TransactionsTableLoading } from "./_components/transactions-table.loading";
import { TransactionsTableServer } from "./_components/transactions-table.server";

export default async function TransactionsPage(props: {
  searchParams: Promise<z.infer<typeof transactionsSearchParamsSchema>>;
}) {
  const searchParams = await props.searchParams;
  const search = transactionsSearchParamsSchema.parse(searchParams);

  return (
    <div className="flex flex-col gap-2">
      {/* <div className="flex justify-end gap-2">
        <AddTransactionButton />
        <Button
          variant="outline"
          size="sm"
          // onClick={() =>
          //   exportTableToCSV(table, {
          //     filename: "tasks",
          //     excludeColumns: ["select", "actions"],
          //   })
          // }
        >
          <DownloadIcon className="mr-2 size-4" aria-hidden="true" />
          Download
        </Button>
      </div> */}
      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense
          fallback={<TransactionsTableLoading />}
          key={JSON.stringify(search)}
        >
          <TransactionsTableServer {...search} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
