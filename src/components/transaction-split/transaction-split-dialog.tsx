"use client";

import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { FormContext } from "./form-context";
import { SplitTransactionForm } from "./split-transaction-form";

export function TransactionSplitDialog() {
  const { params, setParams } = useTransactionParams();

  const trpc = useTRPC();

  const { data } = useQuery(
    trpc.transaction.getSplits.queryOptions(
      { transactionId: params.splitTransaction! },
      { enabled: !!params.splitTransaction },
    ),
  );

  const open = !!params.splitTransaction;

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        void setParams({ splitTransaction: null });
      }}
    >
      <DialogContent className="[&>button]:hidden">
        <FormContext data={data}>
          <SplitTransactionForm />
        </FormContext>
      </DialogContent>
    </Dialog>
  );
}
