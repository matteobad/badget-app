import { Skeleton } from "../ui/skeleton";

export function CardLoading() {
  return (
    <div className="mb-2 space-y-3 border p-6">
      <Skeleton className="h-[54px] w-[250px]" />
      <Skeleton className="h-[24px] w-[200px]" />
      <Skeleton className="h-[20px] w-[100px]" />
    </div>
  );
}
