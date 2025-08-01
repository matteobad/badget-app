import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { defaultPeriod, options, spendingExampleData } from "./data";
import { SpendingCategoryList } from "./spending-category-list";

type Props = {
  period: string;
};

export function SpendingList({ period }: Props) {
  const trpc = useTRPC();

  const selectedPeriod =
    options.find((option) => option.id === period) ?? defaultPeriod;

  const { data } = useSuspenseQuery(
    trpc.metrics.spending.queryOptions({
      from: selectedPeriod.from,
      to: selectedPeriod.to,
    }),
  );

  const spending = data?.length ? data : spendingExampleData;

  if (!spending?.length) {
    return (
      <div className="flex aspect-square items-center justify-center">
        <p className="text-sm text-[#606060]">
          No transactions have been categorized in this period.
        </p>
      </div>
    );
  }

  return (
    <SpendingCategoryList data={spending} selectedPeriod={selectedPeriod} />
  );
}
