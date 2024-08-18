"use client";

import type { LucideIcon } from "lucide-react";
import { type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { AvatarFallback } from "@radix-ui/react-avatar";

import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { buttonVariants } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

interface SidebarItemProps {
  title: string;
  label?: string;
  icon: LucideIcon | string | null;
  variant: "default" | "ghost";
}

export function SidebarItem({ title, label, icon, variant }: SidebarItemProps) {
  const Icon = icon;

  return (
    <Link
      href="#"
      className={cn(
        buttonVariants({ variant, size: "sm" }),
        "w-full px-4",
        variant === "default" &&
          "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
        "justify-start",
      )}
    >
      {typeof icon === "string" || icon === null ? (
        <Avatar className="mr-2 h-4 w-4 bg-slate-200">
          {icon && <AvatarImage src={icon}></AvatarImage>}
        </Avatar>
      ) : (
        // @ts-expect-error TODO: fixme
        <Icon className="mr-2 h-4 w-4" />
      )}

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

export function SidebarItemSkeleton() {
  return (
    <div className="flex w-full px-4">
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-4 w-[150px]" />
    </div>
  );
}
