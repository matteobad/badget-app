"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon } from "lucide-react";

import { sidebarItems } from "~/app/config";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface SidebarItemProps {
  title: string;
  link: string;
  label?: string;
  icon: LucideIcon;
  variant: "default" | "ghost";
}

function SidebarItem({ title, link, label, icon, variant }: SidebarItemProps) {
  const Icon = icon;

  return (
    <Link
      href={link}
      className={cn(
        buttonVariants({ variant, size: "sm" }),
        "w-full px-4",
        variant === "default" &&
          "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
        "justify-start",
      )}
    >
      <Icon className="mr-2 h-4 w-4" />
      {title}
      {label && (
        <span
          className={cn(
            "ml-auto",
            variant === "default" && "text-background dark:text-white",
          )}
        >
          {label}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-2">
      <div className="px-3 py-2">
        <div className="space-y-1">
          <Button variant="secondary" className="w-full justify-start gap-2">
            <LayoutDashboardIcon className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="space-y-1">
          {sidebarItems.map((item, index) => {
            const active = pathname.includes(item.link);
            return (
              <SidebarItem
                key={index}
                icon={item.icon}
                title={item.title}
                link={item.link}
                variant={active ? "default" : "ghost"}
                label={item.label}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
