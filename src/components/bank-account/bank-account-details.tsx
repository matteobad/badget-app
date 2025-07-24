import type { DB_AttachmentType } from "~/server/db/schema/transactions";
import type { AccountType } from "~/shared/constants/enum";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormatAmount } from "~/components/format-amount";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { useBankAccountParams } from "~/hooks/use-bank-account-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { UploadDropzone } from "~/utils/uploadthing";
import { format } from "date-fns";
import { toast } from "sonner";

import { BankLogo } from "../bank-logo";
import { CategorySelect } from "../category/forms/category-select";

export function BankAccountDetails() {
  const [, setAttachments] = useState<DB_AttachmentType[]>([]);

  const { params } = useBankAccountParams();
  const bankAccountId = params.bankAccountId!;

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.bankAccount.getById.queryOptions(
      { id: bankAccountId },
      {
        enabled: !!bankAccountId,
        staleTime: 0, // Always consider data stale so it always refetches
        // initialData: () => {
        //   const pages = queryClient
        //     .getQueriesData({ queryKey: trpc.transaction.get.infiniteQueryKey() })
        //     // @ts-expect-error investigate this
        //     .flatMap(([, data]) => data?.pages ?? [])
        //     .flatMap((page) => page.data ?? []);

        //   return pages.find((d) => d.id === transactionId);
        // },
      },
    ),
  );

  const updateBankAccountMutation = useMutation(
    trpc.bankAccount.update.mutationOptions({
      onSuccess: (_data) => {
        toast.success("Bank account updated");
        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.get.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.bankConnection.get.queryKey(),
        });
      },
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await Promise.all([
          queryClient.cancelQueries({
            queryKey: trpc.bankAccount.getById.queryKey({
              id: bankAccountId,
            }),
          }),
          queryClient.cancelQueries({
            queryKey: trpc.bankAccount.get.queryKey(),
          }),
        ]);

        // Snapshot the previous values
        const previousData = {
          details: queryClient.getQueryData(
            trpc.bankAccount.getById.queryKey({ id: bankAccountId }),
          ),
          list: queryClient.getQueryData(trpc.bankAccount.get.queryKey()),
        };

        // Optimistically update details view
        queryClient.setQueryData(
          trpc.bankAccount.getById.queryKey({ id: bankAccountId }),
          // @ts-expect-error update payload can have undefined fields
          (old) => {
            return {
              ...old,
              ...variables,
            };
          },
        );

        // Optimistically update list view
        queryClient.setQueryData(
          trpc.bankAccount.get.queryKey(),
          // @ts-expect-error update payload can have undefined fields
          (old) => {
            if (!old || !variables) return old;

            return [
              ...old,
              {
                ...data,
                ...variables,
              },
            ];
          },
        );

        return { previousData };
      },
      onError: (_, __, context) => {
        // Revert both caches on error
        queryClient.setQueryData(
          trpc.bankAccount.getById.queryKey({ id: bankAccountId }),
          context?.previousData.details,
        );
        queryClient.setQueryData(
          trpc.bankAccount.get.queryKey(),
          context?.previousData.list,
        );
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.getById.queryKey({ id: bankAccountId }),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.get.queryKey(),
        });
      },
    }),
  );

  if (isLoading || !data) {
    return null;
  }

  const defaultValue = [""];

  if (data?.description) {
    defaultValue.push("description");
  }

  return (
    <div className="scrollbar-hide h-[calc(100vh-80px)] overflow-auto pb-12">
      <div className="mb-8 flex justify-between">
        <div className="flex flex-1 flex-col gap-8">
          {isLoading ? (
            <div className="mt-1 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-[14px] w-[100px] rounded-full" />
              </div>
              <Skeleton className="h-[14px] w-[10%] rounded-full" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {data.logoUrl && <BankLogo src={data.logoUrl} alt={data.name} />}
              <span className="text-xs text-[#606060] select-text">
                {data.updatedAt && format(new Date(data.updatedAt), "MMM d, y")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex w-full flex-col space-y-1">
              {isLoading ? (
                <Skeleton className="mb-2 h-[30px] w-[50%] rounded-md" />
              ) : (
                <span className={cn("font-mono text-4xl select-text")}>
                  <FormatAmount
                    amount={data?.balance}
                    currency={data?.currency}
                  />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {data?.description && (
        <div className="border px-4 py-3 text-sm text-popover-foreground select-text dark:bg-[#1A1A1A]/95">
          {data.description}
        </div>
      )}

      <div className="mt-6 mb-2 grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category" className="mb-2 block">
            Type
          </Label>

          <CategorySelect
            value={data.type}
            onValueChange={(value) => {
              updateBankAccountMutation.mutate({
                id: bankAccountId,
                type: value as AccountType,
              });
            }}
          />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={defaultValue}>
        <AccordionItem value="attachment">
          <AccordionTrigger>Attachments</AccordionTrigger>
          <AccordionContent className="select-text">
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden">
              <UploadDropzone
                content={{
                  uploadIcon: <></>,
                }}
                className="mt-0 h-[200px]"
                endpoint="attachmentUploader"
                onClientUploadComplete={(res) => {
                  // Do something with the response
                  console.log("Files: ", res);
                  const serverData = res[0]?.serverData.attachments ?? "[]";
                  const uploaded = JSON.parse(
                    serverData,
                  ) as DB_AttachmentType[];
                  // const attachmentIds = uploaded.map((_) => _.id);
                  setAttachments(uploaded);
                  toast.info("Attachment caricati");
                }}
                onUploadError={(error: Error) => {
                  // Do something with the error.
                  console.error(error.message);
                  toast.error(error.message);
                }}
              />
            </div>
            {/* <ul className="mt-4 space-y-4">
              {data.attachments.map((file) => (
                <div
                  className="flex items-center justify-between"
                  key={file.id}
                >
                  <div className="flex w-80 flex-col space-y-0.5">
                    <span className="truncate">{file.filename}</span>
                    <span className="text-xs text-muted-foreground">
                      {file.size && formatSize(file.size)}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="flex w-auto hover:bg-transparent"
                    // disabled={deleteAttachment.isExecuting}
                    // onClick={() =>
                    //   deleteAttachment.execute({
                    //     id: file.id,
                    //     fileKey: file.fileKey,
                    //   })
                    // }
                  >
                    <XIcon size={14} />
                  </Button>
                </div>
              ))}
            </ul> */}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="general">
          <AccordionTrigger>General</AccordionTrigger>
          <AccordionContent className="select-text">
            <div className="mb-4 border-b pb-4">
              <Label className="text-md mb-2 block font-medium">
                Exclude from analytics
              </Label>
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <p className="text-xs text-muted-foreground">
                    Exclude this bank account from analytics like profit,
                    expense and revenue. This is useful for internal transfers
                    between accounts to avoid double-counting.
                  </p>
                </div>

                <Switch
                  checked={data.enabled}
                  onCheckedChange={(checked) => {
                    updateBankAccountMutation.mutate({
                      id: bankAccountId,
                      enabled: checked,
                    });
                  }}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="description">
          <AccordionTrigger>Description</AccordionTrigger>
          <AccordionContent className="select-text">
            <Textarea
              placeholder="Informazioni aggiuntive"
              className="min-h-[100px] resize-none bg-background"
              defaultValue={data.description ?? ""}
              onBlur={(event) => {
                updateBankAccountMutation.mutate({
                  id: bankAccountId,
                  description: event.target.value,
                });
              }}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
