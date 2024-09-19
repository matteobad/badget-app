"use client";

import type dynamicIconImports from "lucide-react/dynamicIconImports";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shapes } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { type z } from "zod";

import type { CarouselApi } from "~/components/ui/carousel";
import Icon from "~/components/icons";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { type upsertCategoryBulkSchema } from "~/lib/validators";
import { upsertCategoryBulkAction } from "~/server/actions/insert-category-action";
import { BudgetPeriod, CategoryType } from "~/server/db/schema/enum";
import { useSearchParams } from "./_hooks/use-search-params";

type UpsertCategoryBulkType = z.infer<
  typeof upsertCategoryBulkSchema
>["categories"];

const BASIC_CATEGORIES = [
  {
    name: "Entrate",
    macro: "Entrate",
    type: CategoryType.INCOME,
    icon: "arrow-left",
    userId: "user_id_placeholder",
    budgets: [
      {
        budget: "1500",
        period: BudgetPeriod.MONTH,
        activeFrom: new Date(), // placeholder
        categoryId: 0, // placeholder
        userId: "user_id_placeholder", // placeholder
      },
    ],
  },
  {
    name: "Uscite",
    macro: "Uscite",
    type: CategoryType.OUTCOME,
    icon: "arrow-right",
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
    icon: "arrow-left-right",
    userId: "user_id_placeholder",
    budgets: [],
  },
] as const satisfies UpsertCategoryBulkType;

const DEFAULT_CATEGORIES = [
  {
    name: "Entrate",
    macro: "Entrate",
    type: CategoryType.INCOME,
    icon: "arrow-left",
    userId: "user_id_placeholder",
    budgets: [
      {
        budget: "1500",
        period: BudgetPeriod.MONTH,
        activeFrom: new Date(), // placeholder
        categoryId: 0, // placeholder
        userId: "user_id_placeholder", // placeholder
      },
    ],
  },
  {
    name: "Necessità",
    macro: "Necessità",
    type: CategoryType.OUTCOME,
    icon: "arrow-right",
    userId: "user_id_placeholder",
    budgets: [
      {
        budget: "750",
        period: BudgetPeriod.MONTH,
        activeFrom: new Date(), // placeholder
        categoryId: 0, // placeholder
        userId: "user_id_placeholder", // placeholder
      },
    ],
  },
  {
    name: "Svago",
    macro: "Svago",
    type: CategoryType.OUTCOME,
    icon: "party-popper",
    userId: "user_id_placeholder",
    budgets: [
      {
        budget: "450",
        period: BudgetPeriod.MONTH,
        activeFrom: new Date(), // placeholder
        categoryId: 0, // placeholder
        userId: "user_id_placeholder", // placeholder
      },
    ],
  },
  {
    name: "Risparmio",
    macro: "Risparmio",
    type: CategoryType.OUTCOME,
    icon: "piggy-bank",
    userId: "user_id_placeholder",
    budgets: [
      {
        budget: "300",
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
    icon: "arrow-left-right",
    userId: "user_id_placeholder",
    budgets: [],
  },
] as const satisfies UpsertCategoryBulkType;

export default function Categories() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState<
    UpsertCategoryBulkType[]
  >([BASIC_CATEGORIES, DEFAULT_CATEGORIES]);

  const [, setParams] = useSearchParams();

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const { execute, isExecuting } = useAction(upsertCategoryBulkAction, {
    onError: ({ error }) => {
      toast.error(
        error.serverError ?? error.validationErrors?.categories?._errors,
      );
    },
    onSuccess: () => {
      toast.success("Categorie create!");
      void setParams({ step: "banking-rules" }, { shallow: false });
    },
  });

  const updateCategoryBudget = (
    category: number,
    budget: number,
    value: string,
  ) => {
    const newCategories = categoryOptions.map((c, cIdx) => {
      if (cIdx !== current) return c;
      return c.map((item, idx) => {
        if (idx !== category) return item;
        return {
          ...item,
          budgets: item.budgets.map((b, bIdx) => {
            if (bIdx !== budget) return b;
            return {
              ...b,
              budget: value,
            };
          }),
        };
      });
    });

    setCategoryOptions(newCategories);
  };

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
          <Carousel
            setApi={setApi}
            className="w-[calc(100vw-3rem)] max-w-sm flex-1 pt-6"
          >
            <CarouselPrevious className="absolute left-auto right-10 top-0" />
            <CarouselNext className="absolute right-0 top-0" />
            <CarouselContent>
              {categoryOptions.map((option, optionIndex) => {
                return (
                  <CarouselItem key={optionIndex}>
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-square flex-col items-center justify-start gap-6 p-6">
                          <span className="w-full text-center font-bold">
                            {optionIndex === 0
                              ? "Voglia farla semplice"
                              : "50/30/20"}
                          </span>
                          <ul className="w-full space-y-2 text-left font-light">
                            {option.map((category, categoryIndex) => {
                              return (
                                <>
                                  <li className="flex items-center">
                                    <Icon
                                      name={
                                        category.icon as keyof typeof dynamicIconImports
                                      }
                                      className="mr-2 size-4"
                                    />
                                    {category.name}
                                    <div className="ml-auto h-8 text-right">
                                      {category.type === "TRANSFER" ? (
                                        "-"
                                      ) : (
                                        <Input
                                          placeholder="1.500,00 €"
                                          value={category?.budgets[0]?.budget}
                                          onChange={(e) =>
                                            updateCategoryBudget(
                                              categoryIndex,
                                              0,
                                              e.target.value,
                                            )
                                          }
                                          className="ml-auto h-8 w-28 text-right"
                                        />
                                      )}
                                    </div>
                                  </li>
                                  {categoryIndex < option.length - 1 &&
                                    category.type !==
                                      option[categoryIndex + 1]?.type && (
                                      <Separator className="my-2" />
                                    )}
                                </>
                              );
                            })}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
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
            execute({ categories: categoryOptions[current]! });
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
