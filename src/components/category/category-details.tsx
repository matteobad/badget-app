"use client";

import type { IconName } from "lucide-react/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCategoryParams } from "~/hooks/use-category-params";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { DynamicIcon } from "lucide-react/dynamic";
import { Area, AreaChart } from "recharts";

import type { ChartConfig } from "../ui/chart";
import { ColorPicker } from "../forms/color-picker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { CategoryShortcuts } from "./category-shortcuts";

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
          queryKey: trpc.category.get.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.category.getById.queryKey({ id: categoryId }),
        });
      },
    }),
  });

  const defaultValue = ["general"];

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
              <div className="flex items-center gap-2">
                <DynamicIcon
                  size={14}
                  name={(category?.icon as IconName) ?? "circle-dashed"}
                />
                <span className="text-xs text-[#606060] uppercase select-text">
                  {category?.parentId}
                </span>
              </div>
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
                  <ColorPicker
                    className="top-[5px] size-7 rounded-none p-0"
                    value={category?.color ?? "#fafafa"}
                    onSelect={(newColor) => {
                      updateCategoryMutation.mutate({
                        id: categoryId,
                        color: newColor,
                      });
                    }}
                  />

                  {/* <div className="size-7 pl-10">
                    <IconPicker
                      value={(category?.icon as IconName) ?? "circle-dashed"}
                      onValueChange={(newIcon) => {
                        updateCategoryMutation.mutate({
                          id: categoryId,
                          icon: newIcon,
                        });
                      }}
                    >
                      <Button variant="ghost" className="h-7 p-0">
                        <DynamicIcon
                          className="h-full p-0"
                          name={(category?.icon as IconName) ?? "circle-dashed"}
                        />
                      </Button>
                    </IconPicker>
                  </div> */}

                  <span className="pl-10 font-mono text-4xl select-text">
                    {category?.name}
                  </span>
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
                // checked={data?.status === "excluded"}
                // onCheckedChange={(checked) => {
                //   updateTransactionMutation.mutate({
                //     id: data?.id,
                //     status: checked ? "excluded" : "booked",
                //   });
                // }}
                />
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <Label className="text-md mb-2 block font-medium">
                Description
              </Label>
              <Textarea
                placeholder="Informazioni aggiuntive"
                className="min-h-[100px] resize-none bg-background"
                defaultValue={category?.description ?? ""}
                // onChange={(_value) => {
                //   updateTransactionMutation.mutate({
                //     id: data?.id,
                //     // note: value,
                //   });
                // }}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* <CreateBudgetForm /> */}

      <CategoryShortcuts />
    </div>
  );
}
