"use client";

import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, PencilRuler } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { type z } from "zod";

import Icon from "~/components/icons";
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
import {
  type getUncategorizedTransactions,
  type getUserCategories,
} from "~/server/db/queries/cached-queries";
import { useSearchParams } from "./_hooks/use-search-params";

export default function Rules({
  categories,
  transactions,
}: {
  categories: Awaited<ReturnType<typeof getUserCategories>>;
  transactions: Awaited<ReturnType<typeof getUncategorizedTransactions>>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const showText = useDebounce(true, 800);

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
        void setParams({ step: "banking-done" });
      },
    },
  );

  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center"
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      {showText && (
        <motion.div
          variants={{
            show: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
          initial="hidden"
          animate="show"
          className="mx-5 flex max-w-[-webkit-fill-available] flex-col items-center space-y-8 text-center sm:mx-auto"
        >
          <motion.h1
            className="font-cal flex items-center text-4xl font-bold transition-colors sm:text-5xl"
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, type: "spring" },
              },
            }}
          >
            <PencilRuler className="mr-4 size-10" />
            Regole
          </motion.h1>
          <motion.p
            className="max-w-md text-muted-foreground transition-colors sm:text-lg"
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, type: "spring" },
              },
            }}
          >
            Raccogliere le info non è sufficiente per darti una visione sensata.
            Per questo uniamo AI e sofisticati algoritmi per aprendere dalle tue
            scelte e automatizzare le operazioni noiose
          </motion.p>
          <motion.div
            className="flex w-full gap-4 pb-4"
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, type: "spring" },
              },
            }}
          >
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
                                      name={category.icon ?? "circle-dashed"}
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
          </motion.div>
          <motion.div
            className="flex w-full justify-end pt-6"
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, type: "spring" },
              },
            }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => void setParams({ step: "banking-categories" })}
            >
              <span className="w-full text-center font-bold">Indietro</span>
            </Button>
            <span className="flex-1"></span>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => void setParams({ step: "banking-done" })}
            >
              <span className="w-full text-center font-bold">Salta</span>
            </Button>
            <Button
              variant="default"
              size="lg"
              disabled={isExecuting}
              onClick={() => formRef.current?.requestSubmit()}
            >
              <span className="w-full text-center font-bold">Avanti</span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
