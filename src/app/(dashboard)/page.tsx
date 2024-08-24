import { Suspense } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { type z } from "zod";

import { Skeleton } from "~/components/ui/skeleton";
import BankBalanceServer from "~/components/widgets/banking/bank-balance.server";
import CategoryTypeSpendingServer from "~/components/widgets/banking/category-type-spending.server";
import { OverviewChart } from "~/components/widgets/banking/overview-chart";
import RecentTransactionTable from "~/components/widgets/banking/recent-transactions-table";
import { type dashboardSearchParamsSchema } from "~/lib/validators";
import { CategoryType } from "~/server/db/schema/enum";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: z.infer<typeof dashboardSearchParamsSchema>;
}) {
  const from = searchParams.from
    ? new Date(searchParams.from)
    : startOfMonth(new Date());
  const to = searchParams.to
    ? new Date(searchParams.to)
    : endOfMonth(new Date());

  return (
    <div className="grid grid-cols-4 gap-6 p-8">
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
          type={CategoryType.SAVINGS_AND_INVESTMENTS}
        />
      </Suspense>
      <div className="col-span-2">
        <OverviewChart />
      </div>
      <div className="col-span-2">
        <RecentTransactionTable />
      </div>

      {/* <div>
        <Carousel className="flex flex-col items-end">
          <div className="flex items-center gap-4">
            <CarouselPrevious className="relative inset-0" />
            <CarouselNext className="relative inset-0" />
          </div>
          <CarouselContent className="grid grid-cols-2 gap-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <CarouselItem key={index}>
                <RecentTransactionTable />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div> */}
    </div>
  );
}
