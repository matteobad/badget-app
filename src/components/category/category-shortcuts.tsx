"use client";

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

export function CategoryShortcuts() {
  // const trpc = useTRPC();
  // const queryClient = useQueryClient();

  // const { params } = useTransactionParams();
  // const transactionId = params.transactionId;

  // const { data: transaction } = useQuery(
  //   trpc.transaction.getById.queryOptions(
  //     {
  //       id: transactionId!,
  //     },
  //     {
  //       enabled: !!transactionId,
  //     },
  //   ),
  // );

  // const updateTransactionMutation = useMutation(
  //   trpc.transaction.update.mutationOptions({
  //     onSuccess: () => {
  //       void queryClient.invalidateQueries({
  //         queryKey: trpc.transaction.getById.queryKey({ id: transactionId! }),
  //       });

  //       void queryClient.invalidateQueries({
  //         queryKey: trpc.transaction.get.infiniteQueryKey(),
  //       });
  //     },
  //   }),
  // );

  // useHotkeys(
  //   "meta+m",
  //   (event) => {
  //     event.preventDefault();
  //     if (!transaction?.attachments || transaction.attachments.length === 0) {
  //       updateTransactionMutation.mutate({
  //         id: transactionId!,
  //         //   status: transaction?.status === "completed" ? "booked" : "completed",
  //       });
  //     }
  //   },
  //   { enabled: !!transactionId },
  // );

  return (
    <div className="absolute right-4 bottom-4 left-4 bg-[#FAFAF9] dark:bg-[#121212]">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {/* <span className="flex h-6 items-center justify-center border border-border px-2 text-[10px] text-[#666]">
            ⌘ M
          </span>
          <span className="text-[10px] text-[#666]">
            {transaction?.isFulfilled
              ? "Mark as uncompleted"
              : "Mark as completed"}
          </span> */}
        </div>

        <div className="flex gap-2">
          <div className="flex h-6 w-6 items-center justify-center border border-border text-[#666]">
            <ArrowUpIcon className="size-3.5" />
          </div>

          <div className="flex h-6 w-6 items-center justify-center border border-border text-[#666]">
            <ArrowDownIcon className="size-3.5" />
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-6 items-center justify-center border border-border px-2 text-[10px] text-[#666]">
              Esc
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
