"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { RocketIcon } from "lucide-react";

// import { TeamDropdown } from "./team-dropdown";
import { MainMenu } from "./main-menu";

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={cn(
        "desktop:overflow-hidden desktop:rounded-tl-[10px] desktop:rounded-bl-[10px] fixed top-0 z-50 hidden h-screen flex-shrink-0 flex-col items-center justify-between bg-sidebar pb-4 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] md:flex",
        "border-r border-border bg-background",
        isExpanded ? "w-[240px]" : "w-[70px]",
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={cn(
          "absolute top-0 left-0 flex h-[70px] items-center justify-center border-b border-border bg-background transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isExpanded ? "w-full" : "w-[69px]",
        )}
      >
        <Link href="/" className="absolute left-[22px] transition-none">
          <RocketIcon className="size-6" />
        </Link>
      </div>

      <div className="flex w-full flex-1 flex-col pt-[70px]">
        <MainMenu isExpanded={isExpanded} />
      </div>

      {/* <TeamDropdown isExpanded={isExpanded} /> */}
    </aside>
  );
}
