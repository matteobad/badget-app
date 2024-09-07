"use client";

import { useReducer, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Banknote,
  PartyPopper,
  PiggyBank,
  Plus,
  Shapes,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { euroFormat } from "~/lib/utils";
import { type upsertCategoryBulkSchema } from "~/lib/validators";
import { upsertCategoryBulkAction } from "~/server/actions/insert-category-action";
import { BudgetPeriod, CategoryType } from "~/server/db/schema/enum";

const BASIC_CATEGORIES = [
  {
    name: "Entrate",
    macro: "Entrate",
    type: CategoryType.INCOME,
    userId: "user_id_placeholder",
    budgets: [],
  },
  {
    name: "Uscite",
    macro: "Uscite",
    type: CategoryType.OUTCOME,
    userId: "user_id_placeholder",
    budgets: [
      {
        budget: "1000",
        period: BudgetPeriod.MONTH,
        activeFrom: new Date(), // placeholder
        categoryId: 0, // placeholder
        userId: "user_id_placeholder", // placeholder
      },
    ],
  },
  {
    name: "Trasferimenti",
    macro: "Trasferimenti",
    type: CategoryType.TRANSFER,
    userId: "user_id_placeholder",
    budgets: [],
  },
] as const satisfies z.infer<typeof upsertCategoryBulkSchema>["categories"];

const DEFAULT_CATEGORIES = [
  {
    name: "Stipendio",
    macro: "Entrate",
    type: CategoryType.INCOME,
    userId: "user_id_placeholder",
    budgets: [],
  },
  {
    name: "Necessità",
    macro: "Necessità",
    type: CategoryType.OUTCOME,
    userId: "user_id_placeholder",
    budgets: [],
  },
  {
    name: "Svago",
    macro: "Svago",
    type: CategoryType.OUTCOME,
    userId: "user_id_placeholder",
    budgets: [],
  },
  {
    name: "Risparmio",
    macro: "Risparmio",
    type: CategoryType.OUTCOME,
    userId: "user_id_placeholder",
    budgets: [],
  },
  {
    name: "Trasferimenti",
    macro: "Trasferimenti",
    type: CategoryType.TRANSFER,
    userId: "user_id_placeholder",
    budgets: [],
  },
] as const satisfies z.infer<typeof upsertCategoryBulkSchema>["categories"];

export default function Categories() {
  const [income, setIncome] = useState<string>("1500");
  const [selected, setSelected] = useState<"basic" | "default" | "custom">(
    "default",
  );
  const [categories, setCategories] =
    useState<z.infer<typeof upsertCategoryBulkSchema>["categories"]>(
      DEFAULT_CATEGORIES,
    );

  const searchParams = useSearchParams();
  const router = useRouter();

  const [value, setValue] = useReducer((_: unknown, next: string) => {
    const digits = next.replace(/\D/g, "");
    return euroFormat(Number(digits) / 100);
  }, income.toString());

  // eslint-disable-next-line @typescript-eslint/ban-types
  function handleChange(realChangeFn: Function, formattedValue: string) {
    const digits = formattedValue.replace(/\D/g, "");
    const realValue = Number(digits) / 100;
    realChangeFn(realValue.toPrecision(2));
  }

  const { execute, isExecuting } = useAction(upsertCategoryBulkAction, {
    onError: ({ error }) => {
      toast.error(error.serverError);
    },
    onSuccess: () => {
      const params = new URLSearchParams(searchParams);
      params.set("step", "banking-rules");
      toast.success("Categorie create!");
      router.push(`/onboarding?${params.toString()}`);
    },
  });

  const showText = useDebounce(true, 800);

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
            <Shapes className="mr-4 size-10" />
            Categorie
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
            Il primo passo è prendere consapevolezza delle proprie spese. Per
            farlo possiamo creare delle categorie. Ogni persona ha esigenze
            diverse perciò offriamo completa personalizzazione.
          </motion.p>
          <motion.div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3"
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
              className="flex h-full flex-col items-start justify-start gap-4 border p-4"
              variant={selected === "basic" ? "secondary" : "outline"}
              size="lg"
              onClick={() => {
                setSelected("basic");
                setCategories(BASIC_CATEGORIES);
              }}
            >
              <span className="w-full text-center font-bold">
                Voglia farla semplice
              </span>
              <ul className="w-full text-left font-light">
                <li className="flex items-center">
                  <ArrowLeft className="mr-2 size-3" /> Entrate
                </li>
                <Separator className="my-2" />
                <li className="flex items-center">
                  <ArrowRight className="mr-2 size-3" /> Uscite
                  <span className="ml-auto">
                    {euroFormat(1000, { maximumFractionDigits: 0 })}
                  </span>
                </li>
                <Separator className="my-2" />
                <li className="flex items-center">
                  <ArrowLeftRight className="mr-2 size-3" /> Trasferimenti
                </li>
              </ul>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="flex h-full flex-col items-start justify-start gap-4 border p-4"
                  variant={selected === "default" ? "secondary" : "outline"}
                  size="lg"
                  onClick={() => {
                    setSelected("default");
                    setCategories(DEFAULT_CATEGORIES);
                  }}
                >
                  <span className="w-full text-center font-bold">50/30/20</span>
                  <ul className="w-full text-left font-light">
                    <li className="flex items-center">
                      <Banknote className="mr-2 size-3" /> Stipendio
                      <span className="ml-auto">
                        {euroFormat(income, { maximumFractionDigits: 0 })}
                      </span>
                    </li>
                    <Separator className="my-2" />
                    <li className="flex items-center">
                      <ArrowRight className="mr-2 size-3" /> Necessità
                      <span className="ml-auto">50%</span>
                    </li>
                    <li className="flex items-center">
                      <PartyPopper className="mr-2 size-3" /> Svago
                      <span className="ml-auto">30%</span>
                    </li>
                    <li className="flex items-center">
                      <PiggyBank className="mr-2 size-3" /> Risparmio
                      <span className="ml-auto">20%</span>
                    </li>
                    <Separator className="my-2" />
                    <li className="flex items-center">
                      <ArrowLeftRight className="mr-2 size-3" /> Trasferimenti
                    </li>
                  </ul>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="center">
                <Input
                  className="text-rigth"
                  placeholder="1.000"
                  type="text"
                  onChange={(ev) => {
                    setIncome(ev.target.value);
                  }}
                  onBlur={() => {
                    setCategories(
                      DEFAULT_CATEGORIES.map((category) => ({
                        ...category,
                        budgets: [
                          {
                            budget:
                              category.type === CategoryType.INCOME
                                ? income
                                : category.type === CategoryType.OUTCOME
                                  ? (
                                      parseFloat(income) *
                                      (category.name === "Necessità"
                                        ? 0.5
                                        : category.name === "Svago"
                                          ? 0.3
                                          : category.name === "Risparmio"
                                            ? 0.2
                                            : 0)
                                    ).toString()
                                  : "0",
                            period: BudgetPeriod.MONTH,
                            activeFrom: new Date(), // placeholder
                            categoryId: 0, // placeholder
                            userId: "user_id_placeholder", // placeholder
                          },
                        ].filter(() => category.type !== CategoryType.TRANSFER),
                      })),
                    );
                  }}
                  value={income}
                />
              </PopoverContent>
            </Popover>
            <Button
              className="flex h-full flex-col items-start justify-start gap-4 border p-4"
              variant={selected === "custom" ? "secondary" : "outline"}
              size="lg"
              onClick={() => {
                setSelected("custom");
                setCategories([]);
              }}
            >
              <span className="w-full text-center font-bold">
                So quello che faccio
              </span>
              <div className="font-light">
                <ul className="text-left">
                  <li className="flex items-center">
                    <Plus className="mr-2 size-3" /> Crea categorie
                  </li>
                </ul>
              </div>
            </Button>
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
                router.push("/onboarding?step=banking-transactions")
              }
            >
              <span className="w-full text-center font-bold">Indietro</span>
            </Button>
            <span className="flex-1"></span>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push("/onboarding?step=banking-rules")}
            >
              <span className="w-full text-center font-bold">Salta</span>
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => {
                execute({ categories });
              }}
              disabled={isExecuting}
            >
              <span className="w-full text-center font-bold">Avanti</span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
