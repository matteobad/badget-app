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
import { useCategoryParams } from "~/hooks/use-category-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { createCategorySchema } from "~/shared/validators/category.schema";
import { useForm } from "react-hook-form";
import { type z } from "zod/v4";

import { CategoryTypeSelect } from "./category-type-select";
import { ColorIconPicker } from "./color-icon-picker";

export default function CreateCategoryForm({
  className,
}: React.ComponentProps<"form">) {
  const tScoped = useScopedI18n("category");
  const { params, setParams } = useCategoryParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery(trpc.category.get.queryOptions({}));

  const createMutation = useMutation(
    trpc.category.create.mutationOptions({
      onSuccess: (_data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transactionCategory.get.queryKey(),
        });

        void setParams({ createCategory: null });

        // reset form
        form.reset();
      },
    }),
  );

  const form = useForm<z.infer<typeof createCategorySchema>>({
    resolver: standardSchemaResolver(createCategorySchema),
    defaultValues: {
      type: "expense",
      name: "",
      parentId: params.categoryId ?? undefined,
    },
  });

  const handleSubmit = (data: z.infer<typeof createCategorySchema>) => {
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
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="grid w-full gap-3">
                <FormLabel>{tScoped("labels.classification")}</FormLabel>
                <FormControl>
                  <CategoryTypeSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={tScoped("placeholders.type")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                      onChange={(event) => {
                        // TODO: validate unique slug
                        field.onChange(event);
                        form.setValue(
                          "slug",
                          event.target.value.replaceAll(" ", "_").toLowerCase(),
                        );
                      }}
                      onBlur={(event) => {
                        const slug = event.target.value
                          .replaceAll(" ", "_")
                          .toLowerCase();
                        const alreadyExists = categories?.some(
                          (c) => c.slug === slug,
                        );
                        if (alreadyExists)
                          form.setError("name", { message: "Already exists" });
                        else form.clearErrors("name");
                      }}
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
                  onValueChange={(value) => {
                    const parent = categories?.find((c) => c.id === value);
                    if (!parent) return console.error("Invalid parent");
                    field.onChange(value);
                    form.setValue("type", parent.type);
                  }}
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
