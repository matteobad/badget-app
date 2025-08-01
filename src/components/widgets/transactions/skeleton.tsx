import { Skeleton } from "~/components/ui/skeleton";

export function TransactionsListSkeleton() {
  return (
    <div className="divide-y">
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      {[...Array(12)].map((_, index) => (
        <div
          key={index.toString()}
          className="flex h-[49px] items-center justify-between px-3"
        >
          <div className="w-[60%]">
            <Skeleton className="h-3 w-[50%]" />
          </div>
          <div className="ml-auto w-[40%]">
            <Skeleton className="align-start h-3 w-[60%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
