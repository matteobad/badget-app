import type { ColorKey } from "~/shared/constants/colors";
import type { IconName } from "lucide-react/dynamic";
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
import { createCategorySchema } from "~/shared/validators/category.schema";
import { useForm } from "react-hook-form";
import { type z } from "zod/v4";

import { ColorPicker } from "../../forms/color-picker";
import { IconPicker } from "../../ui/icon-picker";
import { CategoryTypeSelect } from "./category-type-select";

export default function CreateCategoryForm({
  className,
}: React.ComponentProps<"form">) {
  const { setParams } = useCategoryParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery(trpc.category.get.queryOptions({}));

  const createMutation = useMutation(
    trpc.category.create.mutationOptions({
      onSuccess: (_data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.category.get.queryKey(),
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
      name: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof createCategorySchema>) => {
    const formattedData = {
      ...data,
    };

    createMutation.mutate(formattedData);
  };

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
                <FormLabel>Classification</FormLabel>
                <FormControl>
                  <CategoryTypeSelect
                    value={field.value}
                    onValueChange={field.onChange}
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
                <FormItem className="grid w-full gap-3">
                  <FormLabel>Nome categoria</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Category name"
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
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="grid size-9 gap-3">
                  <FormControl>
                    <ColorPicker
                      className="border"
                      value={field.value as ColorKey}
                      onSelect={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem className="grid h-9 gap-3">
                  <FormControl>
                    <IconPicker
                      value={field.value as IconName}
                      onValueChange={field.onChange}
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
                <FormLabel>Parent category (optional)</FormLabel>
                <CategorySelect
                  {...field}
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
            Create Category
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
}
