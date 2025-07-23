import { Skeleton } from "../ui/skeleton";

export function BankAccountListSkeleton() {
  return (
    <div className="space-y-6 divide-y px-6 pb-6">
      <div className="flex items-center justify-between">
        <div className="ml-[30px] divide-y">
          <div className="mb-4 flex items-center justify-between pt-4">
            <div className="flex items-center">
              <Skeleton className="flex h-9 w-9 items-center justify-center space-y-0 rounded-full" />
              <div className="ml-4 flex flex-col">
                <p className="mb-1 text-sm leading-none font-medium">
                  <Skeleton className="h-3 w-[200px] rounded-none" />
                </p>
                <span className="text-xs font-medium text-[#606060]">
                  <Skeleton className="mt-1 h-2.5 w-[100px] rounded-none" />
                </span>
              </div>
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between pt-4">
            <div className="flex items-center">
              <Skeleton className="flex h-9 w-9 items-center justify-center space-y-0 rounded-full" />
              <div className="ml-4 flex flex-col">
                <p className="mb-1 text-sm leading-none font-medium">
                  <Skeleton className="h-3 w-[200px] rounded-none" />
                </p>
                <span className="text-xs font-medium text-[#606060]">
                  <Skeleton className="mt-1 h-2.5 w-[100px] rounded-none" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
