"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCategoryParams } from "~/hooks/use-category-params";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { Area, AreaChart } from "recharts";

import type { ChartConfig } from "../ui/chart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { CategoryBadge } from "./category-badge";
import { CategoryShortcuts } from "./category-shortcuts";
import { CategorySelect } from "./forms/category-select";
import { ColorIconPicker } from "./forms/color-icon-picker";

const data = [
  { month: "January", budget: 100, actual: 90 },
  { month: "February", budget: 100, actual: 120 },
  { month: "March", budget: 150, actual: 130 },
  { month: "April", budget: 150, actual: 140 },
  { month: "May", budget: 150, actual: 100 },
  { month: "June", budget: 100, actual: 100 },
];

const chartConfig = {
  budget: {
    label: "Budget",
    color: "var(--chart-1)",
  },
  actual: {
    label: "Actual",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function CategoryDetails() {
  const { params } = useCategoryParams();
  const categoryId = params.categoryId!;

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: category, isLoading } = useQuery({
    ...trpc.category.getById.queryOptions({ id: categoryId }),
    enabled: !!categoryId,
  });

  const updateCategoryMutation = useMutation({
    ...trpc.category.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transactionCategory.get.queryKey({}),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.category.getById.queryKey({ id: categoryId }),
        });
      },
    }),
  });

  const defaultValue = ["general"];

  if (!category) return;

  return (
    <div className="scrollbar-hide h-[calc(100vh-80px)] overflow-auto pb-12">
      <div className="mb-8 flex justify-between">
        <div className="flex flex-1 flex-col gap-8">
          {isLoading ? (
            <div className="mt-1 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-[14px] w-[100px] rounded-full" />
              </div>
              <Skeleton className="h-[14px] w-[10%] rounded-full" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#606060] uppercase select-text">
                {category?.type && category.type}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex w-full flex-col space-y-1">
              {isLoading ? (
                <Skeleton className="mb-2 h-[30px] w-[50%] rounded-md" />
              ) : (
                <div className="relative flex items-center gap-2">
                  <CategoryBadge
                    category={category}
                    className="h-9 gap-2 px-3 py-2 text-xl [&>svg]:size-5"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            left: 0,
            right: 0,
          }}
        >
          <Area
            dataKey="actual"
            fill="var(--color-actual)"
            fillOpacity={0.05}
            stroke="var(--color-actual)"
            strokeWidth={2}
            type="step"
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
        </AreaChart>
      </ChartContainer>

      <Accordion type="multiple" defaultValue={defaultValue}>
        <AccordionItem value="general">
          <AccordionTrigger className="ring-inset">General</AccordionTrigger>
          <AccordionContent className="select-text">
            <div className="mb-4 border-b pb-4">
              <Label className="text-md mb-2 block font-medium">
                Customize
              </Label>
              <div className="relative grid w-full gap-3">
                <ColorIconPicker
                  className="border-r-solid absolute bottom-0 left-0 size-10 rounded-none border-r border-none shadow-none"
                  selectedColor={category.color}
                  selectedIcon={category.icon}
                  onColorChange={(color) => {
                    updateCategoryMutation.mutate({ id: category.id, color });
                  }}
                  onIconChange={(icon) => {
                    updateCategoryMutation.mutate({ id: category.id, icon });
                  }}
                />
                <Input
                  defaultValue={category.name}
                  className="h-10 rounded-none bg-background pl-12 shadow-none"
                  placeholder="Category name"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  onBlur={(event) => {
                    const name = event.target.value;
                    const slug = event.target.value
                      .replaceAll(" ", "_")
                      .toLowerCase();

                    updateCategoryMutation.mutate({
                      id: category.id,
                      name,
                      slug,
                    });
                  }}
                />
              </div>
            </div>
            <div className="mb-4 border-b pb-4">
              <Label className="text-md mb-2 block font-medium">
                Parent Category
              </Label>
              <CategorySelect
                defaultValue={category.parentId ?? undefined}
                onValueChange={(value) => {
                  updateCategoryMutation.mutate({
                    id: category.id,
                    parentId: value,
                  });
                }}
              />
            </div>
            <div className="mb-4 border-b pb-4">
              <Label className="text-md mb-2 block font-medium">
                Description
              </Label>
              <Textarea
                placeholder="Informazioni aggiuntive"
                className="min-h-[100px] resize-none rounded-none bg-background shadow-none"
                defaultValue={category?.description ?? ""}
                onBlur={(event) => {
                  const description = event.target.value;
                  updateCategoryMutation.mutate({
                    id: category.id,
                    description,
                  });
                }}
              />
            </div>
            <div className="">
              <Label className="text-md mb-2 block font-medium">
                Exclude from analytics
              </Label>
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <p className="text-xs text-muted-foreground">
                    Exclude this transaction from analytics like profit, expense
                    and revenue. This is useful for internal transfers between
                    accounts to avoid double-counting.
                  </p>
                </div>

                <Switch
                  checked={category.excludeFromAnalytics ?? undefined}
                  onCheckedChange={(checked) => {
                    updateCategoryMutation.mutate({
                      id: category.id,
                      excludeFromAnalytics: checked,
                    });
                  }}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="transactions">
          <AccordionTrigger className="ring-inset">
            Recent transactions
          </AccordionTrigger>
          <AccordionContent className="select-text">TODO</AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* <CreateBudgetForm /> */}

      <CategoryShortcuts />
    </div>
  );
}
