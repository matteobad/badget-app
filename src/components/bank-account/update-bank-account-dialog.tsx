import type { AccountType } from "~/server/db/schema/enum";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CurrencyInput } from "../custom/currency-input";
import { SubmitButton } from "../submit-button";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Account Name must be at least 1 characters.",
  }),
  type: z.string(),
  balance: z.number().min(0, {
    message: "Balance must be at least 0.",
  }),
});

type Props = {
  id: string;
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
  defaultName: string | null;
  defaultType?: string | null;
  defaultBalance: number | null;
};

export function UpdateBankAccountDialog({
  id,
  onOpenChange,
  isOpen,
  defaultName,
  defaultType,
  defaultBalance,
}: Props) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      name: defaultName ?? undefined,
      type: defaultType ?? undefined,
      balance: defaultBalance ?? undefined,
    },
  });

  const updateAccountMutation = useMutation(
    trpc.bankAccount.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.bankConnection.get.queryKey(),
        });

        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.get.queryKey(),
        });

        onOpenChange(false);
      },
    }),
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateAccountMutation.mutate({
      id,
      name: values.name,
      balance: values.balance,
      type: values.type as AccountType,
    });
  }

  const accountTypes = () => {
    return [
      "depository",
      "credit",
      "other_asset",
      "loan",
      "other_liability",
    ].map((type) => (
      <SelectItem key={type} value={type}>
        {type}
      </SelectItem>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[455px]"
        onOpenAutoFocus={(evt) => evt.preventDefault()}
      >
        <div className="p-4">
          <DialogHeader>
            <DialogTitle className="flex justify-between">
              Edit Account
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus
                        placeholder="Company Account"
                        autoComplete="off"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You can change the name of the account here
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Change account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>{accountTypes()}</SelectContent>
                    </Select>
                    <FormDescription>Change the account type</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Balance</FormLabel>

                    <FormControl>
                      <CurrencyInput
                        min={0}
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.floatValue);
                        }}
                      />
                    </FormControl>

                    <FormDescription>
                      Change the account balance
                    </FormDescription>
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-10 w-full">
                <div className="w-full space-y-4">
                  <SubmitButton
                    isSubmitting={updateAccountMutation.isPending}
                    className="w-full"
                    type="submit"
                  >
                    Save
                  </SubmitButton>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
