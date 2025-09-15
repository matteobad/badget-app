"use client";

import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { ImageOffIcon } from "lucide-react";

import { Skeleton } from "../ui/skeleton";
import { FilePreviewIcon } from "./file-preview-icon";

type Props = {
  mimeType: string;
  filePath: string;
};

function ErrorPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-primary/10">
      <div className="flex flex-col items-center justify-center">
        <ImageOffIcon className="size-4" />
      </div>
    </div>
  );
}

export function FilePreview({ mimeType, filePath }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  let src = null;

  if (mimeType.startsWith("image/")) {
    src = `/api/proxy?filePath=${filePath}`;
  }

  if (
    mimeType.startsWith("application/pdf") ||
    mimeType.startsWith("application/octet-stream")
  ) {
    // NOTE: Make a image from the pdf
    src = `/api/preview?filePath=${filePath}`;
  }

  useEffect(() => {
    if (src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setIsLoading(false);
        setIsError(false);
      };
      img.onerror = () => {
        setIsLoading(false);
        setIsError(true);
      };
    }
  }, [src]);

  if (!src) {
    return <FilePreviewIcon mimetype={mimeType} />;
  }

  if (isError) {
    return <ErrorPreview />;
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && <Skeleton className="absolute inset-0 h-full w-full" />}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="File Preview"
        className={cn(
          "h-full w-full border border-border object-contain dark:border-none",
          isLoading ? "opacity-0" : "opacity-100",
          "transition-opacity duration-100",
        )}
        onError={() => setIsError(true)}
      />
    </div>
  );
}
