"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, PencilRuler } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { type z } from "zod";

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
import { updateTransactionCategoryBulkSchema } from "~/lib/validators";
import { updateTransactionCategoryBulkAction } from "~/server/actions/bank-transaction-action";
import {
  type getUserCategories,
  type getUserTransactions,
} from "~/server/db/queries/cached-queries";
import { useSearchParams } from "./_hooks/use-search-params";

export default function Rules({
  categories,
  transactions,
}: {
  categories: Awaited<ReturnType<typeof getUserCategories>>;
  transactions: Awaited<ReturnType<typeof getUserTransactions>>;
}) {
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
            className="flex gap-4 pb-4"
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
                onSubmit={form.handleSubmit(execute)}
                className="flex flex-col gap-2"
              >
                {transactions.slice(0, 5).map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-end justify-between gap-2"
                  >
                    <FormField
                      control={form.control}
                      name={`transactions.${transaction.id}.description`}
                      render={({ field }) => (
                        <FormItem className="text-left">
                          <FormLabel
                            className={cn("text-slate-500", {
                              "sr-only": index !== 0,
                            })}
                          >
                            Descrizione
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Satispay" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <ArrowRight className="mb-3 size-4" />
                    <FormField
                      control={form.control}
                      name={`transactions.${transaction.id}.categoryId`}
                      render={({ field }) => (
                        <FormItem className="text-left">
                          <FormLabel
                            className={cn("text-slate-500", {
                              "sr-only": index !== 0,
                            })}
                          >
                            Categoria
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Satispay" {...field} />
                          </FormControl>
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
              disabled={isExecuting || !form.formState.isValid}
              onClick={() => console.log("submit form")}
            >
              <span className="w-full text-center font-bold">Avanti</span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
