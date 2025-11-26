"use client";

import { MoreVerticalIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { generateCanvasPdf } from "~/shared/helpers/canvas-to-pdf";
import { ArtifactTabs } from "../artifact-tabs";

interface CanvasHeaderProps {
  title: string;
}

export function CanvasHeader({ title }: CanvasHeaderProps) {
  const { theme } = useTheme();

  const handleDownloadReport = async () => {
    try {
      await generateCanvasPdf({
        filename: `${title.toLowerCase().replace(/\s+/g, "-")}-report.pdf`,
        theme,
      });
    } catch {}
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-[#131313]">
      <ArtifactTabs />

      <div className="flex justify-end mr-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="p-0 h-6 w-6">
              <MoreVerticalIcon size={15} className="text-muted-foreground" />
            </Button>
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
