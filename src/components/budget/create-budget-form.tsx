import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { cn } from "~/lib/utils";
import { type DB_CategoryType } from "~/server/db/schema/categories";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { createCategorySchema } from "~/shared/validators/category.schema";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { type z } from "zod/v4";

export default function CreateBudgetForm({
  className,
}: React.ComponentProps<"form">) {
  const categories: DB_CategoryType[] = [];
  const { setParams } = useBudgetParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    trpc.category.createCategory.mutationOptions({
      onSuccess: (_data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.category.getCategoryTree.queryKey(),
        });

        // reset form
        form.reset();

        // TODO: navigate to next form
        void setParams(null);
      },
    }),
  );

  const form = useForm<z.infer<typeof createCategorySchema>>({
    resolver: standardSchemaResolver(createCategorySchema),
    defaultValues: {
      name: "",
      color: "",
      slug: "",
      description: "",
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
            name="name"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Nome categoria</FormLabel>
                <FormControl>
                  <Input
                    {...field}
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Categoria Padre</FormLabel>
                <CategoryPicker
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}
                  options={categories}
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
