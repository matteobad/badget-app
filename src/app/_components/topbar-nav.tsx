// import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";
import { SparklesIcon } from "lucide-react";

import { SheetMenu } from "~/components/sheet-menu";
import { Input } from "~/components/ui/input";

// import { Skeleton } from "~/components/ui/skeleton";
// import { UserNav } from "./user-nav";

export function TopbarNav() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center justify-between px-6">
        <SheetMenu />
        <div className="relative">
          <SparklesIcon className="absolute left-3 top-2.5 size-4 text-slate-500" />
          <Input
            placeholder="Chatta con le tue finanze"
            className="h-9 min-w-72 pl-9"
          />
        </div>
        <UserButton />
        {/* <Suspense fallback={<Skeleton className="size-6 rounded-full" />}>
          <UserNav />
        </Suspense> */}
      </div>
    </nav>
  );
}
