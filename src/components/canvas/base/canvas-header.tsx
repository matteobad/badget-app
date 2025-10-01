"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { MoreVerticalIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Skeleton } from "./skeleton";

interface CanvasHeaderProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function CanvasHeader({
  title,
  description,
  isLoading = false,
  actions,
  className,
}: CanvasHeaderProps) {
  const { theme } = useTheme();

  const handleDownloadReport = async () => {
    try {
      console.log("TODO download");
      // await generateCanvasPdf({
      //   filename: `${title.toLowerCase().replace(/\s+/g, "-")}-report.pdf`,
      //   theme,
      // });
    } catch {}
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <div className="space-y-2">
          <Skeleton width="8rem" height="1.125rem" />
          {description && <Skeleton width="12rem" height="0.875rem" />}
        </div>
        {actions && (
          <div className="flex gap-2">
            <Skeleton width="3rem" height="2rem" />
            <Skeleton width="3rem" height="2rem" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("mb-4 flex items-center justify-between", className)}>
      <div>
        <h2 className="text-[12px] leading-[23px] text-[#707070] dark:text-[#666666]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[12px] text-[#707070] dark:text-[#666666]">
            {description}
          </p>
        )}
      </div>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MoreVerticalIcon size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDownloadReport}>
              Download Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
