import { Skeleton } from "../ui/skeleton";

export function FinancialMetricsSkeleton() {
  return (
    <div className="grid gap-6 p-6 pb-4 lg:grid-cols-3">
      <div className="mb-2 space-y-3 border p-6">
        <Skeleton className="h-[54px] w-[250px]" />
        <Skeleton className="h-[24px] w-[200px]" />
        <Skeleton className="h-[20px] w-[100px]" />
      </div>
      <div className="mb-2 space-y-3 border p-6">
        <Skeleton className="h-[54px] w-[250px]" />
        <Skeleton className="h-[24px] w-[200px]" />
        <Skeleton className="h-[20px] w-[100px]" />
      </div>
      <div className="mb-2 space-y-3 border p-6">
        <Skeleton className="h-[54px] w-[250px]" />
        <Skeleton className="h-[24px] w-[200px]" />
        <Skeleton className="h-[20px] w-[100px]" />
      </div>
    </div>
  );
}
