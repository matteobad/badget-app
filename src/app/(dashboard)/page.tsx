import { Suspense } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { type z } from "zod";

import { DateRangePicker } from "~/components/data-range-picker";
import { Skeleton } from "~/components/ui/skeleton";
import BankBalanceServer from "~/components/widgets/banking/bank-balance.server";
import CategorySpendingServer from "~/components/widgets/banking/category-spending.server";
import CategoryTypeSpendingServer from "~/components/widgets/banking/category-type-spending.server";
import { type dashboardSearchParamsSchema } from "~/lib/validators";
import { CategoryType } from "~/server/db/schema/enum";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: z.infer<typeof dashboardSearchParamsSchema>;
}) {
  const from = searchParams.from
    ? startOfMonth(new Date(searchParams.from))
    : startOfMonth(new Date());

  // TODO: can we allow range filtering?
  const to = searchParams.from
    ? endOfMonth(new Date(searchParams.from))
    : endOfMonth(new Date());

  return (
    <div className="flex w-full flex-col items-end gap-6 p-8">
      <DateRangePicker />
      <div className="grid grid-cols-4 gap-6">
        <Suspense fallback={<Skeleton className="" />}>
          <BankBalanceServer />
        </Suspense>
        <Suspense fallback={<Skeleton className="" />}>
          <CategoryTypeSpendingServer
            from={from}
            to={to}
            type={CategoryType.INCOME}
          />
        </Suspense>
        <Suspense fallback={<Skeleton className="" />}>
          <CategoryTypeSpendingServer
            from={from}
            to={to}
            type={CategoryType.OUTCOME}
          />
        </Suspense>
        <Suspense fallback={<Skeleton className="" />}>
          <CategoryTypeSpendingServer
            from={from}
            to={to}
            type={CategoryType.TRANSFERS}
          />
        </Suspense>
        <div className="col-span-4">
          <Suspense fallback={<Skeleton className="" />}>
            <CategorySpendingServer from={from} to={to} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
