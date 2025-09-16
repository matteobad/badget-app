"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useDocumentParams } from "~/hooks/use-document-params";
import { cn } from "~/lib/utils";

import { FilePreview } from "../transaction-attachment/file-preview";
import { Skeleton } from "../ui/skeleton";
import { VaultItemActions } from "./vault-item-actions";
import { VaultItemTags } from "./vault-item-tags";

type Props = {
  data: Partial<RouterOutput["documents"]["get"]["data"][number]> & {
    id: string;
    name?: string | null;
    metadata: Record<string, unknown>;
    pathTokens: string[];
    title: string;
    summary: string;
  };
  small?: boolean;
};

export function VaultItem({ data, small }: Props) {
  const { setParams } = useDocumentParams();

  const isLoading = data.processingStatus === "pending";

  return (
    <div
      className={cn(
        "group relative flex h-72 flex-col gap-3 border p-4 text-muted-foreground transition-colors duration-200 hover:bg-muted dark:hover:bg-[#141414]",
        small && "h-48",
      )}
    >
      <div className="absolute top-4 right-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <VaultItemActions
          id={data.id}
          filePath={data.pathTokens ?? []}
          hideDelete={small}
        />
      </div>

      <button
        type="button"
        className={cn(
          "flex h-[84px] w-[60px] items-center justify-center",
          small && "h-[63px] w-[45px]",
          (data?.metadata as { mimetype?: string })?.mimetype?.startsWith(
            "image/",
          ) && "bg-border",
        )}
        onClick={() => {
          void setParams({ documentId: data.id });
        }}
      >
        {data?.metadata?.mimetype === "image/heic" && isLoading ? (
          // NOTE: We convert the heic images to jpeg in the backend, so we need to wait for the image to be processed
          // Otherwise the image will be a broken image, and the cache will not be updated
          <Skeleton className="absolute inset-0 h-full w-full" />
        ) : (
          <FilePreview
            filePath={data?.pathTokens?.join("/") ?? ""}
            mimeType={(data?.metadata as { mimetype?: string })?.mimetype ?? ""}
          />
        )}
      </button>

      <button
        type="button"
        className="flex flex-col text-left"
        onClick={() => {
          void setParams({ documentId: data.id });
        }}
      >
        {
          <h2 className="mt-3 mb-2 line-clamp-1 text-sm text-primary">
            {isLoading ? (
              <Skeleton className="h-4 w-[80%]" />
            ) : (
              (data?.title ?? data?.name?.split("/").at(-1))
            )}
          </h2>
        }

        {isLoading ? (
          <Skeleton className="h-4 w-[50%]" />
        ) : (
          <p className="line-clamp-3 text-xs text-muted-foreground">
            {data?.summary}
          </p>
        )}
      </button>

      {!small && (
        <VaultItemTags
          tags={data?.documentTagAssignments ?? []}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
