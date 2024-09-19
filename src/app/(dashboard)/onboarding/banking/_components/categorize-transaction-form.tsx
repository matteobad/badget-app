import type dynamicIconImports from "lucide-react/dynamicIconImports";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import Icon from "~/components/icons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { updateTransactionCategoryBulkSchema } from "~/lib/validators";
import { updateTransactionCategoryBulkAction } from "~/server/actions/bank-transaction-action";
import { useCategories, useTransactions } from "../_hooks/use-banking";
import { useSearchParams } from "../_hooks/use-search-params";

export function CategorizeTransactionForm({
  formRef,
  setIsExecuting,
}: {
  formRef: React.RefObject<HTMLFormElement>;
  setIsExecuting: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const transactions = useTransactions();
  const categories = useCategories();

  const [, setParams] = useSearchParams();

  const form = useForm<z.infer<typeof updateTransactionCategoryBulkSchema>>({
    resolver: zodResolver(updateTransactionCategoryBulkSchema),
    defaultValues: {
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        description: transaction.description,
        categoryId: transaction.categoryId,
        userId: transaction.userId,
      })),
    },
  });

  const { execute, isExecuting } = useAction(
    updateTransactionCategoryBulkAction,
    {
      onError: ({ error }) => {
        toast.error(error.serverError);
      },
      onSuccess: () => {
        toast.success("Regole aggiornate con successo");
        void setParams({ step: "banking-done" }, { shallow: false });
      },
    },
  );

  useEffect(() => {
    setIsExecuting(isExecuting);
  }, [isExecuting, setIsExecuting]);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(execute)}
        className="flex w-[500px] max-w-full flex-col gap-2"
      >
        {transactions.slice(0, 5).map((transaction, index) => (
          <div
            key={transaction.id}
            className="flex items-end justify-between gap-2"
          >
            <FormField
              control={form.control}
              name={`transactions.${index}.description`}
              render={({ field }) => (
                <FormItem className="w-full text-left">
                  <FormLabel
                    className={cn("text-slate-500", {
                      "sr-only": index !== 0,
                    })}
                  >
                    Descrizione
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ArrowRight className="mb-3 size-4 shrink-0" />
            <FormField
              control={form.control}
              name={`transactions.${index}.categoryId`}
              render={({ field }) => (
                <FormItem className="w-full text-left">
                  <FormLabel
                    className={cn("text-slate-500", {
                      "sr-only": index !== 0,
                    })}
                  >
                    Categoria
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString() ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Categorizza" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          <div className="flex flex-row items-center">
                            <Icon
                              name={
                                category.icon as keyof typeof dynamicIconImports
                              }
                              className="mr-2 size-4"
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </form>
    </Form>
  );
}
