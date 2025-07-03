import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { ColorKey } from "~/shared/constants/colors";
import type { IconKey } from "~/shared/constants/icons";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CategorySelect } from "~/components/category/forms/category-select";
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
  category,
  onComplete,
}: {
  category: NonNullable<RouterOutput["category"]["getById"]>;
  onComplete: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery(
    trpc.category.get.queryOptions({ type: category.type }),
  );

  const form = useForm<z.infer<typeof updateCategorySchema>>({
    resolver: standardSchemaResolver(updateCategorySchema),
    defaultValues: {
      ...category,
    },
  });

  const updateMutation = useMutation(
    trpc.category.updateCategory.mutationOptions({
      onSuccess: (_data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.category.get.queryKey(),
        });

        void queryClient.invalidateQueries({
          queryKey: trpc.category.getFlatTree.queryKey(),
        });

        // reset form
        form.reset();
        // close dialog
        onComplete();
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
        className={cn("flex h-full flex-col gap-6")}
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
                <CategorySelect
                  value={field.value ?? undefined}
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

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onComplete}>
            Annulla
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Salvo categoria...
              </>
            ) : (
              "Salva"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
