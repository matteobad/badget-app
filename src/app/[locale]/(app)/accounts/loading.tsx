import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <Skeleton className="h-4 w-[120px]" />
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <Skeleton className="h-4 w-[120px]" />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
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
