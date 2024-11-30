import { Skeleton } from "~/components/ui/skeleton";

export function BankConnectionListLoading() {
  return (
    <div className="space-y-6 pb-6">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
