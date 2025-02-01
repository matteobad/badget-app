import { Skeleton } from "~/components/ui/skeleton";

export default function CategoriesPage() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="aspect-video rounded-xl bg-muted/50" />
          <Skeleton className="aspect-video rounded-xl bg-muted/50" />
          <Skeleton className="aspect-video rounded-xl bg-muted/50" />
          <Skeleton className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <Skeleton className="grid min-h-[100vh] flex-1 overflow-hidden rounded-xl bg-muted/50 md:min-h-min md:grid-cols-3" />
      </div>
    </>
  );
}
