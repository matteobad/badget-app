import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CategorySelect } from "~/components/category/forms/category-select";
import { SubmitButton } from "~/components/submit-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useTransactionCategoryParams } from "~/hooks/use-transaction-category-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { createTransactionCategorySchema } from "~/shared/validators/transaction-category.schema";
import { useForm } from "react-hook-form";
import { type z } from "zod";

import { ColorIconPicker } from "./color-icon-picker";

export default function CreateCategoryForm({
  className,
}: React.ComponentProps<"form">) {
  const tScoped = useScopedI18n("category");
  const { params, setParams } = useTransactionCategoryParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery(
    trpc.transactionCategory.get.queryOptions({}),
  );

  const createMutation = useMutation(
    trpc.transactionCategory.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transactionCategory.get.queryKey(),
        });

        void setParams({ createCategory: null });

        // reset form
        form.reset();
      },
    }),
  );

  const form = useForm<z.infer<typeof createTransactionCategorySchema>>({
    resolver: standardSchemaResolver(createTransactionCategorySchema),
    defaultValues: {
      name: "",
      parentId: params.categoryId ?? undefined,
    },
  });

  const handleSubmit = (
    data: z.infer<typeof createTransactionCategorySchema>,
  ) => {
    const formattedData = {
      ...data,
    };

    createMutation.mutate(formattedData);
  };

  const categoryColor = form.watch("color");
  const categoryIcon = form.watch("icon");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex h-full flex-col gap-6", className)}
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <div className="grid gap-4">
          <div className="flex w-full items-end gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="relative grid w-full gap-3">
                  <FormLabel>{tScoped("labels.name")}</FormLabel>
                  <ColorIconPicker
                    className="border-r-solid absolute bottom-0 left-0 size-10 rounded-none rounded-l-md border-r border-none shadow-none"
                    selectedColor={categoryColor}
                    selectedIcon={categoryIcon}
                    onColorChange={(color) => {
                      form.setValue("color", color);
                    }}
                    onIconChange={(icon) => {
                      form.setValue("icon", icon);
                    }}
                  />
                  <FormControl>
                    <Input
                      {...field}
                      className="h-10 pl-12 shadow-none"
                      placeholder={tScoped("placeholders.name")}
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem className="grid w-full gap-3">
                <FormLabel>{tScoped("labels.parent")}</FormLabel>
                <CategorySelect
                  {...field}
                  placeholder={tScoped("placeholders.parent")}
                  onValueChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="w-full">
          <SubmitButton
            isSubmitting={createMutation.isPending}
            className="w-full"
          >
            {tScoped("actions.create_category")}
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
}
