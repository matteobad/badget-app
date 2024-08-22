import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { OverviewChart } from "~/components/widgets/banking/overview-chart";
import RecentTransactionTable from "~/components/widgets/banking/recent-transactions-table";
import { getBankOverviewChart } from "~/server/db/queries/cached-queries";

export default async function PensionPage() {
  const data = await getBankOverviewChart({});

  return (
    <div className="flex flex-col gap-8">
      <OverviewChart />
      <div>
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
      </div>
    </div>
  );
}
