import type { ColorKey } from "~/shared/constants/colors";
import type { IconKey } from "~/shared/constants/icons";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CategoryPicker } from "~/components/forms/category-picker";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { updateCategorySchema } from "~/shared/validators/category.schema";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { type z } from "zod/v4";

import { ColorPicker } from "../forms/color-picker";
import { IconPicker } from "../forms/icon-picker";

export default function UpdateCategoryForm({
  categoryId,
}: {
  categoryId: string;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: categories, isLoading: isLoadingCategories } = useQuery(
    trpc.category.getAll.queryOptions(),
  );
  const { data: category, isLoading } = useQuery(
    trpc.category.getById.queryOptions({ id: categoryId }),
  );

  const form = useForm<z.infer<typeof updateCategorySchema>>({
    resolver: standardSchemaResolver(updateCategorySchema),
    defaultValues: {
      ...category,
      description: category?.description ?? "",
    },
  });

  const updateMutation = useMutation(
    trpc.category.updateCategory.mutationOptions({
      onSuccess: (_data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.category.getCategoryTree.queryKey(),
        });

        // reset form
        form.reset();
      },
    }),
  );

  const handleSubmit = (data: z.infer<typeof updateCategorySchema>) => {
    const formattedData = {
      ...data,
    };

    updateMutation.mutate(formattedData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("mt-8 flex h-full flex-col")}
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <div className="grid gap-4">
          <div className="relative flex w-full items-center gap-2 divide-x">
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="absolute top-9 left-3 grid gap-3 pr-2.5">
                  <FormControl>
                    <ColorPicker
                      value={field.value as ColorKey}
                      onChange={field.onChange}
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
                <FormItem className="absolute top-9 left-12 grid gap-3 pr-2.5">
                  <FormControl>
                    <IconPicker
                      value={field.value as IconKey}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid w-full gap-3">
                  <FormLabel>Nome categoria</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="pl-23"
                      placeholder=""
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
              <FormItem className="grid gap-3">
                <FormLabel>Categoria Padre</FormLabel>
                <CategoryPicker
                  defaultValue={field.value ?? undefined}
                  options={categories ?? []}
                  isLoading={isLoadingCategories}
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

        <div className="grow"></div>
        <div className="flex items-center gap-4">
          <Button
            className="w-full"
            type="submit"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Modifico categoria...
              </>
            ) : (
              "Modifica categoria"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
