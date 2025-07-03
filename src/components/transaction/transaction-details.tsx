import type { DB_AttachmentType } from "~/server/db/schema/transactions";
import type { Tag } from "emblor";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormatAmount } from "~/components/format-amount";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { cn } from "~/lib/utils";
import { formatSize } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { UploadDropzone } from "~/utils/uploadthing";
import { format } from "date-fns";
import { XIcon } from "lucide-react";
import { toast } from "sonner";

import { CategorySelect } from "../category/forms/category-select";
import { TagsSelect } from "../tag/tags-select";
import { TransactionBankAccount } from "./transaction-bank-account";
import { TransactionShortcuts } from "./transaction-shortcuts";

export function TransactionDetails() {
  const [, setAttachments] = useState<DB_AttachmentType[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const { params } = useTransactionParams();
  const transactionId = params.transactionId!;

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.transaction.getById.queryOptions(
      { id: transactionId },
      {
        enabled: !!transactionId,
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

  const updateTransactionMutation = useMutation(
    trpc.transaction.update.mutationOptions({
      onSuccess: (_data) => {
        toast.success("Transazione aggiornata");
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.getAmountRange.queryKey(),
        });
      },
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await Promise.all([
          queryClient.cancelQueries({
            queryKey: trpc.transaction.getById.queryKey({
              id: transactionId,
            }),
          }),
          queryClient.cancelQueries({
            queryKey: trpc.transaction.get.infiniteQueryKey(),
          }),
        ]);

        // Snapshot the previous values
        const previousData = {
          details: queryClient.getQueryData(
            trpc.transaction.getById.queryKey({ id: transactionId }),
          ),
          list: queryClient.getQueryData(
            trpc.transaction.get.infiniteQueryKey(),
          ),
        };

        // Optimistically update details view
        queryClient.setQueryData(
          trpc.transaction.getById.queryKey({ id: transactionId }),
          (old: any) => {
            if (variables.categorySlug) {
              const categories = queryClient.getQueryData(
                trpc.category.get.queryKey(),
              );
              const category = categories?.find(
                (c) => c.slug === variables.categorySlug,
              );

              if (category) {
                return {
                  ...old,
                  ...variables,
                  category,
                };
              }
            }

            return {
              ...old,
              ...variables,
            };
          },
        );

        // Optimistically update list view
        queryClient.setQueryData(
          trpc.transaction.get.infiniteQueryKey(),
          (old) => {
            if (!old?.pages) return old;

            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                data: page.data.map((transaction: any) =>
                  transaction.id === transactionId
                    ? {
                        ...transaction,
                        ...variables,
                        ...(variables.categorySlug && {
                          category: queryClient
                            .getQueryData(trpc.category.get.queryKey())
                            ?.find((c) => c.slug === variables.categorySlug),
                        }),
                      }
                    : transaction,
                ),
              })),
            };
          },
        );

        return { previousData };
      },
      onError: (_, __, context) => {
        // Revert both caches on error
        queryClient.setQueryData(
          trpc.transaction.getById.queryKey({ id: transactionId }),
          context?.previousData.details,
        );
        queryClient.setQueryData(
          trpc.transaction.get.infiniteQueryKey(),
          context?.previousData.list,
        );
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.getById.queryKey({ id: transactionId }),
        });

        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });
      },
    }),
  );

  const createTransactionTagMutation = useMutation(
    trpc.transactionTag.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.getById.queryKey({ id: transactionId }),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.tag.get.queryKey({}),
        });
      },
    }),
  );

  const deleteTransactionTagMutation = useMutation(
    trpc.transactionTag.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.getById.queryKey({ id: transactionId }),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.tag.get.queryKey({}),
        });
      },
    }),
  );

  if (isLoading || !data) {
    return null;
  }

  const defaultValue = [""];

  if (data?.note) {
    defaultValue.push("note");
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
              {data?.account?.logoUrl && (
                <TransactionBankAccount
                  name={data?.account?.name ?? undefined}
                  logoUrl={data.account.logoUrl}
                  className="text-xs text-[#606060]"
                />
              )}
              <span className="text-xs text-[#606060] select-text">
                {data?.date && format(new Date(data.date), "MMM d, y")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex w-full flex-col space-y-1">
              {isLoading ? (
                <Skeleton className="mb-2 h-[30px] w-[50%] rounded-md" />
              ) : (
                <span
                  className={cn(
                    "font-mono text-4xl select-text",
                    data?.category?.slug === "income" && "text-[#00C969]",
                  )}
                >
                  <FormatAmount
                    amount={data?.amount}
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
            Category
          </Label>

          <CategorySelect
            value={data.category?.id}
            onValueChange={(value) => {
              updateTransactionMutation.mutate({
                id: transactionId,
                categoryId: value,
              });
            }}
          />
        </div>
        <div>
          <Label htmlFor="tags" className="mb-2 block">
            Tags
          </Label>

          <TagsSelect
            key={data?.id + data?.tags?.length}
            tags={data?.tags}
            setTags={(newTags) => {
              const tags = newTags as Tag[];
              const prevTags = Array.isArray(data?.tags) ? data.tags : [];
              const tagsToAdd = tags.filter(
                (tag) => !prevTags.some((prev) => prev.id === tag.id),
              );
              const tagsToRemove = prevTags.filter(
                (prev) => !tags.some((tag) => tag.id === prev.id),
              );

              for (const tag of tagsToAdd) {
                createTransactionTagMutation.mutate({
                  tag: tag,
                  transactionId: transactionId,
                });
              }

              for (const tag of tagsToRemove) {
                deleteTransactionTagMutation.mutate({
                  tagId: tag.id,
                  transactionId: transactionId,
                });
              }
            }}
            activeTagIndex={activeTagIndex}
            setActiveTagIndex={setActiveTagIndex}
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
                  const attachmentIds = uploaded.map((_) => _.id);
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
            <ul className="mt-4 space-y-4">
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
            </ul>
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
                    Exclude this transaction from analytics like profit, expense
                    and revenue. This is useful for internal transfers between
                    accounts to avoid double-counting.
                  </p>
                </div>

                <Switch
                  checked={data?.status === "excluded"}
                  onCheckedChange={(checked) => {
                    updateTransactionMutation.mutate({
                      id: data?.id,
                      status: checked ? "excluded" : "booked",
                    });
                  }}
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-md mb-2 block font-medium">
                  Mark as recurring
                </Label>
                <p className="text-xs text-muted-foreground">
                  Mark as recurring. Similar future transactions will be
                  automatically categorized and flagged as recurring.
                </p>
              </div>
              <Switch
                checked={data?.recurring ?? false}
                onCheckedChange={(checked) => {
                  updateTransactionMutation.mutate({
                    id: data?.id,
                    recurring: checked,
                  });
                }}
              />
            </div>

            {data?.recurring && (
              <Select
                value={data?.frequency ?? undefined}
                onValueChange={async (value) => {
                  updateTransactionMutation.mutate({
                    id: data?.id,
                    frequency: value as
                      | "weekly"
                      | "monthly"
                      | "annually"
                      | "irregular",
                  });
                }}
              >
                <SelectTrigger className="mt-4 w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[
                      { id: "weekly", name: "Weekly" },
                      { id: "monthly", name: "Monthly" },
                      { id: "annually", name: "Annually" },
                    ].map(({ id, name }) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="note">
          <AccordionTrigger>Note</AccordionTrigger>
          <AccordionContent className="select-text">
            <Textarea
              placeholder="Informazioni aggiuntive"
              className="min-h-[100px] resize-none bg-background"
              defaultValue={data?.note ?? ""}
              onChange={(_value) => {
                updateTransactionMutation.mutate({
                  id: data?.id,
                  // note: value,
                });
              }}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <TransactionShortcuts />
    </div>
  );
}
