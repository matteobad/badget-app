"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { PencilRuler } from "lucide-react";
import { useDebounce } from "use-debounce";

import { Button } from "~/components/ui/button";
import {
  type getUncategorizedTransactions,
  type getUserCategories,
} from "~/server/db/queries/cached-queries";
import { CategorizeTransactionForm } from "./_components/categorize-transaction-form";
import { useSearchParams } from "./_hooks/use-search-params";

export default function Rules({
  categories,
  transactions,
}: {
  categories: Awaited<ReturnType<typeof getUserCategories>>;
  transactions: Awaited<ReturnType<typeof getUncategorizedTransactions>>;
}) {
  const [isExecuting, setIsExecuting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const showText = useDebounce(true, 800);

  const [, setParams] = useSearchParams();

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
            <CategorizeTransactionForm
              formRef={formRef}
              categories={categories}
              transactions={transactions}
              setIsExecuting={setIsExecuting}
            />
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
              onClick={() =>
                void setParams(
                  { step: "banking-categories" },
                  { shallow: false },
                )
              }
            >
              <span className="w-full text-center font-bold">Indietro</span>
            </Button>
            <span className="flex-1"></span>

            <Button
              variant="ghost"
              size="lg"
              onClick={() =>
                void setParams({ step: "banking-done" }, { shallow: false })
              }
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
