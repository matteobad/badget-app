"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "~/lib/utils";

export type TopbarItem = {
  title: string;
  href: string;
};

export default function Topbar({ items }: { items: TopbarItem[] }) {
  const pathname = usePathname();

  return (
    <div className="inline-flex h-10 items-center justify-center self-start rounded-md bg-muted p-1 text-muted-foreground">
      {items.map((item, index) => {
        return (
          <Link
            data-id={item.href}
            href={item.href}
            key={index}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              {
                "bg-background text-foreground shadow-sm":
                  pathname === item.href,
              },
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}
