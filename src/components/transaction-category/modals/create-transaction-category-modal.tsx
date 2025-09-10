import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubmitButton } from "~/components/submit-button";
import { Button } from "~/components/ui/button";
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
import { useScopedI18n } from "~/shared/locales/client";
import { PlusIcon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";

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
  categories: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      description: z.string().optional(),
      color: z.string().optional(),
      excluded: z.boolean().optional(),
    }),
  ),
});

export function CreateTransactionCategoriesModal({
  onOpenChange,
  isOpen,
}: Props) {
  const tScoped = useScopedI18n("category");

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
    color: undefined,
    excluded: false,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      categories: [newItem],
    },
  });

  useEffect(() => {
    form.reset({
      categories: [newItem],
    });
  }, [isOpen, form]);

  const onSubmit = (data: CreateCategoriesFormValues) => {
    categoriesMutation.mutate(data.categories);
  };

  const { fields, append } = useFieldArray({
    name: "categories",
    control: form.control,
  });

  return (
    <DialogContent className="max-w-[455px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="">
            <DialogHeader className="mb-4">
              <DialogTitle>Create categories</DialogTitle>
              <DialogDescription>
                You can add your own categories here.
              </DialogDescription>
            </DialogHeader>

            <div className="flex max-h-[420px] flex-col space-y-6 overflow-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col space-y-2">
                  <FormField
                    control={form.control}
                    name={`categories.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1 space-y-1">
                        <FormLabel className="text-xs font-normal text-[#878787]">
                          Name
                        </FormLabel>
                        <FormControl>
                          {/* <InputColor
                            autoFocus
                            placeholder="Name"
                            onChange={({ name, color }) => {
                              field.onChange(name);
                              form.setValue(`categories.${index}.color`, color);
                            }}
                            defaultValue={field.value}
                            defaultColor={form.watch(
                              `categories.${index}.color`,
                            )}
                          /> */}
                          <Input
                            {...field}
                            autoFocus
                            className="h-10 pl-12 shadow-none"
                            placeholder={tScoped("placeholders.name")}
                            autoComplete="off"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                            onChange={field.onChange}
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
                        <FormLabel className="text-xs font-normal text-[#878787]">
                          Description
                        </FormLabel>
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

                  <FormField
                    control={form.control}
                    name={`categories.${index}.excluded`}
                    render={({ field }) => (
                      <FormItem className="flex-1 space-y-1">
                        <div className="mt-2 border border-border p-3 pt-1.5">
                          <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                              <FormLabel className="text-xs font-normal text-[#878787]">
                                Exclude from Reports
                              </FormLabel>
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

            <Button
              variant="outline"
              type="button"
              className="mt-4 space-x-1"
              onClick={() => {
                append(newItem);
              }}
            >
              <PlusIcon />
              <span>Add more</span>
            </Button>

            <DialogFooter className="mt-8 items-center !justify-between border-t-[1px] pt-4">
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
