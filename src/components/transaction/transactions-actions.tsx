"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddTransactionButton } from "~/components/transaction/add-transaction-button";
import { useTransactionsStore } from "~/lib/stores/transaction";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { DeleteIcon, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { BulkActions } from "./transaction-bulk-actions";
import { TransactionsColumnVisibility } from "./transactions-column-visibility";

export function TransactionsActions() {
  const { setRowSelection, canDelete, rowSelection } = useTransactionsStore();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteTransactionsMutation = useMutation(
    trpc.transaction.deleteMany.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });

        setRowSelection({});
      },
    }),
  );

  const transactionIds = Object.keys(rowSelection);

  if (transactionIds?.length) {
    return (
      <AlertDialog>
        <div className="ml-auto">
          <div className="flex items-center">
            <span className="w-full text-sm whitespace-nowrap text-[#606060]">
              Bulk edit
            </span>
            <div className="mr-4 ml-4 h-8 w-[1px] bg-border" />

            <div className="flex space-x-2">
              <BulkActions ids={transactionIds} />

              <div>
                {canDelete && (
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="border border-destructive bg-transparent hover:bg-transparent"
                    >
                      <DeleteIcon className="text-destructive" size={18} />
                    </Button>
                  </AlertDialogTrigger>
                )}
              </div>
            </div>
          </div>
        </div>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                console.log("TODO delete");
                deleteTransactionsMutation.mutate({ ids: transactionIds });
              }}
            >
              {deleteTransactionsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <div className="hidden space-x-2 md:flex">
      <TransactionsColumnVisibility />
      <AddTransactionButton label="Aggiungi" />
    </div>
  );
}
