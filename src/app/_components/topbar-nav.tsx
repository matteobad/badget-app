// import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";
import { SparklesIcon } from "lucide-react";

import { SheetMenu } from "~/components/sheet-menu";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";

// import { Skeleton } from "~/components/ui/skeleton";
// import { UserNav } from "./user-nav";

export function TopbarNav() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center justify-between px-8">
        <SheetMenu />
        <div className="relative">
          <SparklesIcon className="absolute left-3 top-2 size-4 text-slate-500" />
          <Input
            placeholder="Chatta con le tue finanze"
            className="h-8 min-w-72 pl-9"
            disabled={true}
          />
          <Badge
            variant="secondary"
            className="absolute right-1.5 top-1.5 opacity-50"
          >
            soon
          </Badge>
        </div>
        <UserButton />
        {/* <Suspense fallback={<Skeleton className="size-6 rounded-full" />}>
          <UserNav />
        </Suspense> */}
      </div>
    </nav>
  );
}
