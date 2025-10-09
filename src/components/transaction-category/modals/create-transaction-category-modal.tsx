import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MinusIcon, PlusIcon } from "lucide-react";
import type { IconName } from "lucide-react/dynamic";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { SubmitButton } from "~/components/submit-button";
import { InputColorIcon } from "~/components/transaction-category/input-color-icon";
import {
  DialogContent,
  DialogDescription,
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
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { createManyTransactionCategorySchema } from "~/shared/validators/transaction-category.schema";

type Props = {
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
};

interface CategoryFormValues {
  name: string;
  description?: string;
  color?: string;
  excluded?: boolean;
}

interface CreateCategoriesFormValues {
  categories: CategoryFormValues[];
}

const formSchema = z.object({
  categories: createManyTransactionCategorySchema,
});

export function CreateTransactionCategoriesModal({
  onOpenChange,
  isOpen,
}: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const categoriesMutation = useMutation(
    trpc.transactionCategory.createMany.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transactionCategory.get.queryKey(),
        });

        onOpenChange(false);
      },
    }),
  );

  const newItem = {
    name: "",
    description: "",
    color: "#525252",
    icon: "circle-dashed" as IconName,
    excluded: false,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categories: [newItem],
    },
  });

  useEffect(() => {
    form.reset({
      categories: [newItem],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, form]);

  const onSubmit = (data: CreateCategoriesFormValues) => {
    categoriesMutation.mutate(data.categories);
  };

  const { fields, append, remove } = useFieldArray({
    name: "categories",
    control: form.control,
  });

  return (
    <DialogContent className="max-w-[455px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="">
            <DialogHeader className="mb-6 p-[3px]">
              <DialogTitle>Create categories</DialogTitle>
              <DialogDescription>
                You can add your own categories here.
              </DialogDescription>
            </DialogHeader>

            <div className="flex max-h-[420px] flex-col space-y-6 overflow-auto p-[3px]">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="group relative flex flex-col space-y-2"
                >
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name={`categories.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-1">
                          <FormLabel>Name</FormLabel>
                          <FormControl className="p-1">
                            <InputColorIcon
                              autoFocus
                              onChange={({ name, color, icon }) => {
                                field.onChange(name);
                                form.setValue(
                                  `categories.${index}.color`,
                                  color,
                                );
                                form.setValue(`categories.${index}.icon`, icon);
                              }}
                              defaultName={field.value}
                              defaultColor={
                                form.watch(`categories.${index}.color`) ??
                                "#fafafa"
                              }
                              defaultIcon={
                                form.watch(
                                  `categories.${index}.icon`,
                                ) as IconName
                              }
                              mode="create"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`categories.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-1">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              autoFocus={false}
                              placeholder="Description"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`categories.${index}.excluded`}
                    render={({ field }) => (
                      <FormItem className="flex-1 space-y-1">
                        <div className="mt-2 border border-border p-3">
                          <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-1">
                              <FormLabel>Exclude from Reports</FormLabel>
                              <div className="text-xs text-muted-foreground">
                                Transactions in this category won&apos;t appear
                                in financial reports
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
              ))}
            </div>

            <div className="flex gap-6 p-[3px]">
              <button
                type="button"
                className="mt-4 flex w-fit cursor-pointer items-center space-x-2 font-mono text-xs text-muted-foreground"
                onClick={() => {
                  append(newItem);
                }}
              >
                <PlusIcon className="size-3.5" />
                <span className="text-xs">Add item</span>
              </button>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    remove(fields.length - 1);
                  }}
                  className="mt-4 flex w-fit cursor-pointer items-center space-x-2 font-mono text-xs text-muted-foreground"
                >
                  <MinusIcon className="size-4 text-muted-foreground" />
                  <span className="text-xs">Remove item</span>
                </button>
              )}
            </div>

            <DialogFooter className="mt-6 items-center !justify-between border-t-[1px] p-[3px] pt-6">
              <div>
                {Object.values(form.formState.errors).length > 0 && (
                  <span className="text-sm text-destructive">
                    Please complete the fields above.
                  </span>
                )}
              </div>
              <SubmitButton isSubmitting={categoriesMutation.isPending}>
                Create
              </SubmitButton>
            </DialogFooter>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
