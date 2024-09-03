import { Skeleton } from "~/components/ui/skeleton";

export function InstitutionListLoading() {
  return (
    <div className="space-y-4">
      {Array.from(new Array(10), (_, index) => (
        <div className="flex items-center space-x-4" key={index.toString()}>
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex flex-col space-y-1">
            <Skeleton className="h-2 w-[140px] rounded-none" />
            <Skeleton className="h-2 w-[40px] rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}
