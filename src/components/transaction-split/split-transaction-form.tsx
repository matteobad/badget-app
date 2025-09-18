import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import type { SplitFormValues } from "./form-context";
import { SubmitButton } from "../submit-button";
import { Button } from "../ui/button";
import { DialogClose } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { LineItems } from "./line-items";
import { Logo } from "./logo";
import { Meta } from "./meta";
import { Summary } from "./summary";

export function SplitTransactionForm() {
  const { setParams } = useTransactionParams();

  const form = useFormContext();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const transactionSplitMutation = useMutation(
    trpc.transaction.addSplit.mutationOptions({
      onSuccess: async () => {
        toast.success("Split registrato correttamente");
        await setParams({ splitTransaction: null });

        await queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  // Submit the form and the draft invoice
  const handleSubmit = (values: SplitFormValues) => {
    transactionSplitMutation.mutate({
      transactionId: values.transaction.id,
      splits: values.splits.map((item) => ({
        ...item,
        category: {
          id: item.category ?? "id",
          slug: item.category ?? "uncategorized",
          name: item.category ?? "Uncategorized",
        },
      })),
    });
  };

  // Prevent form from submitting when pressing enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <form
      // @ts-expect-error types
      onSubmit={form.handleSubmit(handleSubmit)}
      className="h-full"
      onKeyDown={handleKeyDown}
    >
      <ScrollArea
        className="max-h-[500px] overflow-auto bg-background"
        hideScrollbar
      >
        <div className="flex h-full flex-col p-6 pb-4">
          <div className="flex items-end justify-between">
            <Meta />
            <Logo />
          </div>

          <div className="mt-12">
            <LineItems />
          </div>

          <div className="mt-12 flex justify-end">
            <Summary />
          </div>
        </div>
      </ScrollArea>

      <div className="mt-auto flex items-center justify-end gap-4 pt-6">
        <DialogClose asChild>
          <Button variant="ghost" type="button">
            Annulla
          </Button>
        </DialogClose>
        <SubmitButton
          isSubmitting={transactionSplitMutation.isPending}
          disabled={transactionSplitMutation.isPending}
        >
          Crea
        </SubmitButton>
      </div>
    </form>
  );
}
