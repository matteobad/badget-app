import { Skeleton } from "~/components/ui/skeleton";

export function SpendingListSkeleton() {
  return (
    <div className="mt-8 space-y-4">
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      {[...Array(16)].map((_, index) => (
        <div
          key={index.toString()}
          className="flex items-center justify-between"
        >
          <div className="flex w-[70%] items-center space-x-4 pr-8">
            <Skeleton className="size-[12px] flex-shrink-0" />
            <Skeleton className="h-[6px] w-full rounded-none" />
          </div>
          <div className="ml-auto w-full">
            <Skeleton className="align-start h-[6px] w-full rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}
