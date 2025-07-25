import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Skeleton className="grid min-h-[100vh] flex-1 overflow-hidden rounded-xl bg-muted/50 md:min-h-min md:grid-cols-3" />
      </div>
    </>
  );
}
