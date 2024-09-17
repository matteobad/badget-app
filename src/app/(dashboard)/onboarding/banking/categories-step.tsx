"use client";

import { useState } from "react";
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
import { type z } from "zod";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { Separator } from "~/components/ui/separator";
import { euroFormat } from "~/lib/utils";
import { type upsertCategoryBulkSchema } from "~/lib/validators";
import { upsertCategoryBulkAction } from "~/server/actions/insert-category-action";
import { BudgetPeriod, CategoryType } from "~/server/db/schema/enum";
import { useSearchParams } from "./_hooks/use-search-params";

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

  const [, setParams] = useSearchParams();

  const { execute, isExecuting } = useAction(upsertCategoryBulkAction, {
    onError: ({ error }) => {
      toast.error(error.serverError);
    },
    onSuccess: () => {
      toast.success("Categorie create!");
      void setParams({ step: "banking-rules" }, { shallow: false });
    },
  });

  return (
    <motion.div
      className="flex w-full flex-1 flex-col items-center justify-center gap-10 px-3"
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      <motion.div
        className="flex max-w-[-webkit-fill-available] flex-1 flex-col items-center justify-center space-y-8 text-center sm:flex-grow-0"
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.4,
              type: "spring",
              staggerChildren: 0.2,
            },
          },
        }}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="font-cal flex items-center text-4xl font-bold transition-colors sm:text-5xl"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <Shapes className="mr-4 size-10" />
          Categorie
        </motion.h1>
        <motion.p
          className="max-w-md text-muted-foreground transition-colors sm:text-lg"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          Il primo passo è prendere consapevolezza delle proprie spese. Per
          farlo possiamo creare delle categorie. Ogni persona ha esigenze
          diverse perciò offriamo completa personalizzazione.
        </motion.p>
        <motion.div
          className="flex w-full justify-center"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
          initial="hidden"
          animate="visible"
        >
          <Carousel className="w-[calc(100vw-3rem)] max-w-sm flex-1 pt-6">
            <CarouselPrevious className="absolute left-auto right-10 top-0" />
            <CarouselNext className="absolute right-0 top-0" />
            <CarouselContent>
              <CarouselItem>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square flex-col items-center justify-start gap-6 p-6">
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
                          <ArrowLeftRight className="mr-2 size-3" />{" "}
                          Trasferimenti
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square flex-col items-center justify-start gap-6 p-6">
                      <span className="w-full text-center font-bold">
                        50/30/20
                      </span>
                      <ul className="w-full text-left font-light">
                        <li className="flex items-center">
                          <Banknote className="mr-2 size-3" /> Stipendio
                          <span className="ml-auto">
                            {euroFormat(income, {
                              maximumFractionDigits: 0,
                            })}
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
                          <ArrowLeftRight className="mr-2 size-3" />{" "}
                          Trasferimenti
                        </li>
                      </ul>
                      {/* </PopoverTrigger>
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
                                          : category.type ===
                                              CategoryType.OUTCOME
                                            ? (
                                                parseFloat(income) *
                                                (category.name === "Necessità"
                                                  ? 0.5
                                                  : category.name === "Svago"
                                                    ? 0.3
                                                    : category.name ===
                                                        "Risparmio"
                                                      ? 0.2
                                                      : 0)
                                              ).toString()
                                            : "0",
                                      period: BudgetPeriod.MONTH,
                                      activeFrom: new Date(), // placeholder
                                      categoryId: 0, // placeholder
                                      userId: "user_id_placeholder", // placeholder
                                    },
                                  ].filter(
                                    () =>
                                      category.type !== CategoryType.TRANSFER,
                                  ),
                                })),
                              );
                            }}
                            value={income}
                          />
                        </PopoverContent>
                      </Popover> */}
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <div className="flex h-full flex-col gap-4 p-4">
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
                        <Badge className="mx-auto mt-4 flex">Coming soon</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </motion.div>
      </motion.div>
      <motion.div
        className="flex w-full justify-center gap-4"
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate="visible"
      >
        <Button
          className="w-full sm:w-auto"
          variant="ghost"
          size="lg"
          onClick={() =>
            setParams({ step: "banking-accounts" }, { shallow: false })
          }
        >
          <motion.div
            initial={{ opacity: 0, x: +10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <ArrowLeft className="mr-2 size-4" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: +10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Indietro
          </motion.span>
        </Button>
        <Button
          className="w-full sm:w-auto"
          variant="default"
          size="lg"
          disabled={isExecuting}
          onClick={() => {
            execute({ categories });
          }}
        >
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {isExecuting ? "Caricamento..." : "Crea categorie"}
          </motion.span>
        </Button>
      </motion.div>
    </motion.div>
  );
}
