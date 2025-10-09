"use client";

import { XIcon } from "lucide-react";
import { useDocumentParams } from "~/hooks/use-document-params";
import { formatSize } from "~/shared/helpers/format";

import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { FilePreview } from "./file-preview";

export type Attachment = {
  id?: string;
  type: string;
  name: string;
  size: number;
  isUploading?: boolean;
  path?: string[];
};

type Props = {
  file: Attachment;
  onDelete: () => void;
};

export function AttachmentItem({ file, onDelete }: Props) {
  const { setParams } = useDocumentParams();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="h-[40px] w-[40px] cursor-pointer overflow-hidden">
          {file.isUploading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <button
              onClick={() => setParams({ filePath: file?.path?.join("/") })}
              className="h-full w-full"
              type="button"
            >
              <FilePreview
                mimeType={file.type}
                filePath={`${file?.path?.join("/")}`}
              />
            </button>
          )}
        </div>

        <div className="flex w-80 flex-col space-y-0.5">
          <span className="truncate">{file.name}</span>
          <span className="text-xs text-[#606060]">
            {file.size && formatSize(file.size)}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="flex w-auto hover:bg-transparent"
        onClick={onDelete}
      >
        <XIcon size={14} />
      </Button>
    </div>
  );
}
