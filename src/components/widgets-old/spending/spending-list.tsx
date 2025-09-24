import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { GoalIcon } from "lucide-react";

import { defaultPeriod, options } from "./data";
import { SpendingCategoryList } from "./spending-category-list";

type Props = {
  period: string;
};

export function SpendingList({ period }: Props) {
  const trpc = useTRPC();

  const selectedPeriod =
    options.find((option) => option.id === period) ?? defaultPeriod;

  console.log(selectedPeriod);

  const { data: spending } = useSuspenseQuery(
    trpc.metrics.spending.queryOptions({
      from: selectedPeriod.from,
      to: selectedPeriod.to,
    }),
  );

  if (!spending?.length) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2">
        <GoalIcon className="text-muted-foreground" />
        <p className="w-[50%] text-center text-sm text-[#606060]">
          No transactions have been categorized in this period.
        </p>
      </div>
    );
  }

  return (
    <SpendingCategoryList data={spending} selectedPeriod={selectedPeriod} />
  );
}
