"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useUpload } from "~/hooks/use-upload";
import { cn } from "~/lib/utils";
import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { authClient } from "~/shared/helpers/better-auth/auth-client";
import { stripSpecialCharacters } from "~/shared/helpers/documents";
import { useTRPC } from "~/shared/helpers/trpc/client";

import type { Attachment } from "./attachment-item";
import { AttachmentItem } from "./attachment-item";

const normalizePath = (path: unknown): string[] => {
  // eslint-disable-next-line  @typescript-eslint/no-unsafe-return
  if (Array.isArray(path)) return path;
  if (typeof path === "string") return path.split("/");
  return [];
};

type Props = {
  id: string;
  data?: NonNullable<RouterOutput["transaction"]["getById"]>["attachments"];
  onUpload?: (files: Attachment[]) => void;
};

export function TransactionAttachments({ id, data, onUpload }: Props) {
  const [files, setFiles] = useState<Attachment[]>([]);
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { uploadFile } = useUpload();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createAttachmentsMutation = useMutation(
    trpc.transactionAttachment.createMany.mutationOptions({
      onSuccess: () => {
        // invalidate the transaction list query
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });

        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.getById.queryKey({ id }),
        });
      },
    }),
  );

  const deleteAttachmentMutation = useMutation(
    trpc.transactionAttachment.delete.mutationOptions({
      onSuccess: () => {
        // invalidate the transaction details query
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.getById.queryKey({ id }),
        });

        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });
      },
    }),
  );

  const handleOnDelete = (id: string) => {
    setFiles((files) => files.filter((file) => file?.id !== id));
    deleteAttachmentMutation.mutate({ id });
  };

  const onDrop = async (acceptedFiles: Array<Attachment>) => {
    setFiles((prev) => [
      ...prev,
      ...acceptedFiles.map((a) => ({
        name: stripSpecialCharacters(a.name),
        size: a.size,
        type: a.type,
        isUploading: true,
      })),
    ]);

    const uploadedFiles = await Promise.all(
      acceptedFiles.map(async (acceptedFile) => {
        const filename = stripSpecialCharacters(acceptedFile.name);

        const { pathname } = await uploadFile({
          path: [activeOrganization?.id ?? "", "transactions", id, filename],
          file: acceptedFile as File,
        });

        return {
          path: pathname.split("/"),
          name: filename,
          size: acceptedFile.size,
          type: acceptedFile.type,
        };
      }),
    );

    onUpload?.(uploadedFiles);

    createAttachmentsMutation.mutate(
      uploadedFiles.map((file) => ({
        name: file.name,
        type: file.type,
        path: file.path,
        size: file.size,
        transactionId: id,
      })),
    );
  };

  useEffect(() => {
    if (data) {
      setFiles(
        data.map((item) => ({
          id: item.id,
          name: item.filename!,
          path: normalizePath(item?.path),
          size: item.size,
          type: item.type,
        })),
      );
    }
  }, [data]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onDrop,
    onDropRejected: ([reject]) => {
      if (reject?.errors.find(({ code }) => code === "file-too-large")) {
        toast.error("File size to large.");
      }

      if (reject?.errors.find(({ code }) => code === "file-invalid-type")) {
        toast.error("File type not supported.");
      }
    },
    maxSize: 3000000, // 3MB
    accept: {
      "image/*": [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".heic",
        ".heif",
        ".avif",
        ".tiff",
        ".bmp",
      ],
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div>
      {/* <SelectAttachment
        placeholder="Search attachment"
        onSelect={handleOnSelectFile}
        transactionId={id}
      /> */}
      <div
        className={cn(
          "mt-4 flex h-[120px] w-full flex-col justify-center space-y-1 border-2 border-dotted border-border text-center text-[#606060] transition-colors",
          isDragActive && "bg-secondary text-primary",
        )}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <div>
            <p className="text-xs">Drop your files upload</p>
          </div>
        ) : (
          <div>
            <p className="text-xs">
              Drop your files here, or{" "}
              <span className="underline underline-offset-1">
                click to browse.
              </span>
            </p>
            <p className="text-dark-gray text-xs">3MB file limit.</p>
          </div>
        )}
      </div>

      <ul className="mt-4 space-y-4">
        {files.map((file, idx) => (
          <AttachmentItem
            key={`${file.name}-${idx}`}
            file={file}
            onDelete={() => handleOnDelete(file.id!)}
          />
        ))}
      </ul>
    </div>
  );
}
