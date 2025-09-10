import type { DB_AttachmentType } from "~/server/db/schema/transactions";
import type { TransactionFrequencyType } from "~/shared/constants/enum";
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
import { TRANSACTION_FREQUENCY } from "~/shared/constants/enum";
import { formatSize } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { UploadDropzone } from "~/utils/uploadthing";
import { format } from "date-fns";
import { XIcon } from "lucide-react";
import { toast } from "sonner";

import { TagsSelect } from "../tag/tags-select";
import { SelectCategory } from "../transaction-category/select-category";
import { SimilarTransactionsUpdateToast } from "./similar-transactions-update-toast";
import { TransactionBankAccount } from "./transaction-bank-account";
import { TransactionShortcuts } from "./transaction-shortcuts";

export function TransactionDetails() {
  const [, setAttachments] = useState<DB_AttachmentType[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const tScoped = useScopedI18n("transaction");

  const { params } = useTransactionParams();
  const transactionId = params.transactionId!;

  const queryClient = useQueryClient();
  const trpc = useTRPC();

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
    trpc.transaction.updateTransaction.mutationOptions({
      onSuccess: (_data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
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
          // @ts-expect-error update payload can have undefined fields
          (old) => {
            if (variables.categorySlug) {
              const categories = queryClient.getQueryData(
                trpc.transactionCategory.get.queryKey(),
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
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((transaction) =>
                  transaction.id === transactionId
                    ? {
                        ...transaction,
                        ...variables,
                        ...(variables.categorySlug && {
                          category: queryClient
                            .getQueryData(
                              trpc.transactionCategory.get.queryKey(),
                            )
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

  const updateTransactionsMutation = useMutation(
    trpc.transaction.updateMany.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.getById.queryKey({ id: transactionId }),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });
      },
    }),
  );

  const handleTransactionCategoryUpdate = async (category?: {
    id: string;
    slug: string;
    name: string;
  }) => {
    if (!data) return;

    updateTransactionMutation.mutate({
      id: transactionId,
      categoryId: category?.id,
    });

    const similarTransactions = await queryClient.fetchQuery(
      trpc.transaction.getSimilarTransactions.queryOptions(
        {
          transactionId: data.id,
          name: data.name,
          categorySlug: category?.slug,
        },
        { enabled: !!category },
      ),
    );

    if (
      category &&
      similarTransactions?.length &&
      similarTransactions.length > 1
    ) {
      toast.custom(
        (t) => (
          <SimilarTransactionsUpdateToast
            toastId={t}
            similarTransactions={similarTransactions}
            transactionId={data.id}
            category={category}
          />
        ),
        { duration: 6000 },
      );
    }
  };

  const handleTransactionFrequencyUpdate = async (
    frequency?: TransactionFrequencyType,
  ) => {
    if (!data) return;

    updateTransactionMutation.mutate({
      id: transactionId,
      frequency,
    });

    const similarTransactions = await queryClient.fetchQuery(
      trpc.transaction.getSimilarTransactions.queryOptions({
        transactionId: data.id,
        name: data.name,
        frequency,
      }),
    );

    if (similarTransactions?.length && similarTransactions.length > 1) {
      toast.custom(
        (t) => (
          <div className="p-4">
            <div className="mb-1 font-semibold">Badget AI</div>
            <div className="mb-2 text-sm">
              {tScoped("similar", { count: similarTransactions.length })}
            </div>
            <div className="mt-4 flex space-x-2">
              <Button variant="secondary" onClick={() => toast.dismiss(t)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const similarTransactionIds = similarTransactions.map(
                    (tr) => tr.id,
                  );
                  updateTransactionsMutation.mutate({
                    ids: similarTransactionIds,
                    recurring: true,
                    frequency,
                  });
                  toast.dismiss(t);
                }}
              >
                Yes
              </Button>
            </div>
          </div>
        ),
        { duration: 6000 },
      );
    }
  };

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
        <div className="flex flex-1 flex-col">
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

          <h2 className="mt-6 mb-3 select-text">
            {isLoading ? (
              <Skeleton className="mb-2 h-[22px] w-[35%] rounded-md" />
            ) : (
              data?.name
            )}
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex w-full flex-col space-y-1">
              {isLoading ? (
                <Skeleton className="mb-2 h-[30px] w-[50%] rounded-md" />
              ) : (
                <div className="flex items-baseline justify-between">
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
                  <div className="flex items-center gap-2">
                    {/* <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" size="sm">
                          Split transaction
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Split transaction</DialogTitle>
                        </DialogHeader>
                        <TransactionSplitsEditor
                          transactionId={data.id}
                          transactionAmount={data.amount}
                          currency={data.currency}
                          onSaved={() => {
                            // refresh details
                            void queryClient.invalidateQueries({
                              queryKey: trpc.transaction.getById.queryKey({
                                id: data.id,
                              }),
                            });
                            void queryClient.invalidateQueries({
                              queryKey: trpc.transaction.get.infiniteQueryKey(),
                            });
                          }}
                        />
                      </DialogContent>
                    </Dialog> */}
                    <SelectCategory
                      align="end"
                      selected={data.category ?? undefined}
                      onChange={async (category) => {
                        await handleTransactionCategoryUpdate(category);
                      }}
                    />

                    {data.category?.excludeFromAnalytics && (
                      <span className="text-sm text-muted-foreground">
                        (Excluded)
                      </span>
                    )}
                  </div>
                </div>
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

      <div className="mt-6 mb-2 grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="tags" className="mb-2 block">
            {tScoped("tags")}
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
          <AccordionTrigger>{tScoped("attachments")}</AccordionTrigger>
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
          <AccordionTrigger>{tScoped("general")}</AccordionTrigger>
          <AccordionContent className="select-text">
            <div className="mb-4 border-b pb-4">
              <Label className="text-md mb-2 block font-medium">
                {tScoped("exclude_label")}
              </Label>
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <p className="text-xs text-muted-foreground">
                    {tScoped("exclude_description")}
                  </p>
                </div>

                <Switch
                  checked={data?.internal ?? undefined}
                  onCheckedChange={(checked) => {
                    updateTransactionMutation.mutate({
                      id: data?.id,
                      internal: checked,
                    });
                  }}
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-md mb-2 block font-medium">
                  {tScoped("recurring_label")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {tScoped("recurring_description")}
                </p>
              </div>
              <Switch
                checked={data.recurring}
                onCheckedChange={(checked) => {
                  updateTransactionMutation.mutate({
                    id: data.id,
                    recurring: checked,
                  });
                }}
              />
            </div>

            {data?.recurring && (
              <Select
                value={data?.frequency ?? undefined}
                onValueChange={(value: TransactionFrequencyType) =>
                  handleTransactionFrequencyUpdate(value)
                }
              >
                <SelectTrigger className="mt-4 w-full bg-background">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(TRANSACTION_FREQUENCY)
                      .filter((f) => f !== "unknown")
                      .map((frequency) => (
                        <SelectItem key={frequency} value={frequency}>
                          {tScoped(`frequency.${frequency}`)}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="note">
          <AccordionTrigger>{tScoped("notes")}</AccordionTrigger>
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
