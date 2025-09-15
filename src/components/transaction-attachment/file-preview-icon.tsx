"use client";

import { cn } from "~/lib/utils";
import { FileIcon, FileTextIcon, FolderArchiveIcon } from "lucide-react";

type Props = {
  mimetype?: string | null;
  className?: string;
};

export function FilePreviewIcon({ mimetype, className }: Props) {
  switch (mimetype) {
    case "application/pdf":
      return <FileIcon className={cn("h-full w-full", className)} />;
    case "application/zip":
      return <FolderArchiveIcon className={cn("h-full w-full", className)} />;
    default:
      return <FileTextIcon className={cn("h-full w-full", className)} />;
  }
}
