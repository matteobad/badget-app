import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IconName } from "lucide-react/dynamic";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { SubmitButton } from "~/components/submit-button";
import { InputColorIcon } from "~/components/transaction-category/input-color-icon";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { updateTransactionCategorySchema } from "~/shared/validators/transaction-category.schema";

type Props = {
  id: string;
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
  defaultValue: {
    name: string;
    color: string;
    icon: IconName;
    description?: string | null;
    excluded?: boolean | null;
  };
};

export function EditCategoryModal({
  id,
  onOpenChange,
  isOpen,
  defaultValue,
}: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateCategoryMutation = useMutation(
    trpc.transactionCategory.update.mutationOptions({
      onSuccess: () => {
        onOpenChange(false);
        void queryClient.invalidateQueries({
          queryKey: trpc.transactionCategory.get.queryKey(),
        });
      },
    }),
  );

  const form = useForm<z.infer<typeof updateTransactionCategorySchema>>({
    resolver: zodResolver(updateTransactionCategorySchema),
    defaultValues: {
      id,
      name: defaultValue.name,
      color: defaultValue.color,
      icon: defaultValue.icon,
      description: defaultValue.description ?? undefined,
      excluded: defaultValue?.excluded ?? false,
    },
  });

  function onSubmit(values: z.infer<typeof updateTransactionCategorySchema>) {
    updateCategoryMutation.mutate({
      ...values,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[455px]">
        <DialogHeader className="mb-6 p-[3px]">
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-[3px]">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <div className="relative w-full">
                          <InputColorIcon
                            autoFocus
                            mode="edit"
                            onChange={({ name, color, icon }) => {
                              field.onChange(name);
                              form.setValue("color", color);
                              form.setValue("icon", icon);
                            }}
                            defaultName={field.value ?? ""}
                            defaultColor={form.watch("color")!}
                            defaultIcon={form.watch("icon") as IconName}
                          />

                          <FormMessage />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoFocus={false}
                          placeholder="Description"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="excluded"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1">
                    <div className="mt-2 border border-border p-3">
                      <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-1">
                          <FormLabel>Exclude from Reports</FormLabel>
                          <div className="text-xs text-muted-foreground">
                            Transactions in this category won&apos;t appear in
                            financial reports
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6 items-center !justify-between border-t-[1px] p-[3px] pt-6">
              <div>
                {Object.values(form.formState.errors).length > 0 && (
                  <span className="text-sm text-destructive">
                    Please complete the fields above.
                  </span>
                )}
              </div>
              <SubmitButton isSubmitting={updateCategoryMutation.isPending}>
                Save
              </SubmitButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
