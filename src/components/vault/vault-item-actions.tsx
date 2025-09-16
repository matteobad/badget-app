"use client";

import { useState } from "react";
import { CopyCheckIcon, CopyIcon, DownloadIcon, TrashIcon } from "lucide-react";

import { Button } from "../ui/button";

type Props = {
  id: string;
  filePath: string[];
  hideDelete?: boolean;
};

export function VaultItemActions({ hideDelete }: Props) {
  // const [, copy] = useCopyToClipboard();
  const [isCopied] = useState(false);
  // const trpc = useTRPC();
  // const queryClient = useQueryClient();

  // const downloadUrl = `/api/download/file?path=${filePath.join("/")}`;
  // const fileName = filePath.at(-1);

  // const shortLinkMutation = useMutation(
  //   trpc.shortLinks.createForDocument.mutationOptions({
  //     onMutate: () => {
  //       setIsCopied(true);
  //     },
  //     onSuccess: (data) => {
  //       if (data?.shortUrl) {
  //         copy(data.shortUrl);

  //         setTimeout(() => {
  //           setIsCopied(false);
  //         }, 3000);
  //       }
  //     },
  //   }),
  // );

  // const deleteDocumentMutation = useMutation(
  //   trpc.documents.delete.mutationOptions({
  //     onSuccess: () => {
  //       void queryClient.invalidateQueries({
  //         queryKey: trpc.documents.get.infiniteQueryKey(),
  //       });
  //     },
  //   }),
  // );

  return (
    <div className="flex flex-row gap-2">
      <Button
        variant="outline"
        size="icon"
        className="size-7 rounded-full bg-background"
        // onClick={() => {
        //   downloadFile(
        //     `${downloadUrl}&filename=${fileName}`,
        //     fileName || "download",
        //   );
        // }}
      >
        <DownloadIcon className="size-3.5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        type="button"
        // onClick={() =>
        //   shortLinkMutation.mutate({
        //     filePath: filePath.join("/"),
        //     expireIn: 60 * 60 * 24 * 30, // 30 days
        //   })
        // }
        className="size-7 rounded-full bg-background"
      >
        {isCopied ? (
          <CopyCheckIcon className="-mt-0.5 size-3.5" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
      </Button>

      {!hideDelete && (
        <Button
          variant="outline"
          size="icon"
          className="size-7 rounded-full bg-background"
          // onClick={() => deleteDocumentMutation.mutate({ id })}
        >
          <TrashIcon className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
