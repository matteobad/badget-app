import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <header className="flex h-16 shrink-0 flex-col items-start gap-2 px-4">
        <Skeleton className="h-6 w-[220px]" />
        <Skeleton className="h-4 w-[350px]" />
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
          <Skeleton className="aspect-video rounded-xl bg-muted/50" />
          <Skeleton className="aspect-video rounded-xl bg-muted/50" />
          <Skeleton className="aspect-video rounded-xl bg-muted/50" />
          <Skeleton className="aspect-video rounded-xl bg-muted/50" />
        </div>
      </div>
    </>
  );
}
