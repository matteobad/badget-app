import { cn } from "~/lib/utils";

import { Skeleton } from "../ui/skeleton";

type Props = {
  small?: boolean;
};

export function VaultItemSkeleton({ small }: Props) {
  return (
    <div
      className={cn(
        "relative flex h-72 flex-col gap-3 border p-4",
        small && "h-48",
      )}
    >
      {/* Skeleton for the preview area */}
      <Skeleton
        className={cn("h-[84px] w-[60px]", small && "h-[63px] w-[45px]")}
      />

      {/* Skeleton for title and summary */}
      <div className="mt-3 flex flex-col gap-2">
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
      </div>

      {/* Skeleton for tags */}
      {!small && (
        <div className="mt-auto flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      )}
    </div>
  );
}
