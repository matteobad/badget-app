"use client";

import { cn } from "~/lib/utils";
import { TrendingUpIcon } from "lucide-react";

import { BaseWidget } from "./base";

export function Insights() {
  return (
    <div className="relative">
      {Array.from({ length: 5 }).map((_, i) => (
        <BaseWidget
          className={cn("absolute flex h-[200px] w-full bg-accent", {
            "rotate-1": i % 2 === 0,
            "-rotate-1": i % 2 !== 0,
          })}
          title={"Weekly summary"}
          icon={<TrendingUpIcon className="size-4 text-muted-foreground" />}
          description={"description"}
          actions={
            <div className="flex justify-between">
              <span>Action</span>
              <span>Dimiss</span>
            </div>
          }
        />

        // <div
        //   key={i}
        //   className={cn(
        //     "absolute flex h-[200px] w-full rotate-1 cursor-pointer flex-col justify-between border bg-accent p-4 transition-all duration-300 dark:border-[#1d1d1d] dark:bg-[#0c0c0c] dark:hover:border-[#222222] dark:hover:bg-[#0f0f0f]",
        //     {
        //       "rotate-1": i % 2 === 0,
        //       "-rotate-1": i % 2 !== 0,
        //     },
        //   )}
        // />
      ))}
    </div>
  );
}
