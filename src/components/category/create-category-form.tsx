import type { RouterOutput } from "~/server/api/trpc/routers/_app";
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
import { useBudgetParams } from "~/hooks/use-budget-params";
import { useCategoryParams } from "~/hooks/use-category-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { createCategorySchema } from "~/shared/validators/category.schema";
import { Loader2Icon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { useForm } from "react-hook-form";
import { type z } from "zod/v4";

import { ColorPicker } from "../forms/color-picker";
import { IconPicker } from "../forms/icon-picker";

export default function CreateCategoryForm({
  className,
}: React.ComponentProps<"form">) {
  const { setParams } = useCategoryParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery(trpc.category.getAll.queryOptions());

  const createMutation = useMutation(
    trpc.category.createCategory.mutationOptions({
      onSuccess: (_data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.category.getCategoryTree.queryKey(),
        });

        // reset form
        form.reset();
      },
    }),
  );

  const form = useForm<z.infer<typeof createCategorySchema>>({
    resolver: standardSchemaResolver(createCategorySchema),
    defaultValues: {
      name: "",
      color: "neutral",
      icon: "star",
    },
  });

  const handleSubmit = (data: z.infer<typeof createCategorySchema>) => {
    const formattedData = {
      ...data,
    };

    createMutation.mutate(formattedData);
  };

  if (createMutation.isSuccess) {
    return <CreateBudgetConfirm category={createMutation.data[0]!} />;
  }

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

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // close modal
              void setParams(null);
            }}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Creo categoria...
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

function CreateBudgetConfirm({
  category,
}: {
  category: RouterOutput["category"]["createCategory"][number];
}) {
  const { setParams: setCategoryParams } = useCategoryParams();
  const { setParams: setBudgetParams } = useBudgetParams();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-center gap-2">
        <DynamicIcon name="circle-dashed" />
        <span className="text-lg font-semibold">{category.name}</span>
        <p className="mt-2 text-muted-foreground">
          La categoria è stata creata con successo. Vuoi creare anche un budget?
        </p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button
          className="flex-1"
          variant="outline"
          onClick={() => {
            // close modal
            void setCategoryParams(null);
            void setBudgetParams(null);
          }}
        >
          Non ora
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            // create budget form
            void setCategoryParams(null);
            void setBudgetParams({ createBudget: true });
          }}
        >
          Crea budget
        </Button>
      </div>
    </div>
  );
}
