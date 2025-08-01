"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import Link from "next/link";
import { CategoryBadge } from "~/components/category/category-badge";
import { formatISO } from "date-fns";

import { SpendingCategoryItem } from "./spending-category-item";

type Props = {
  selectedPeriod: {
    from: string;
    to: string;
  };
  data: RouterOutput["metrics"]["spending"];
};

export function SpendingCategoryList({ data, selectedPeriod }: Props) {
  return (
    <ul className="scrollbar-hide mt-8 aspect-square space-y-4 overflow-auto pb-14">
      {data?.map((category) => {
        return (
          <li key={category.slug}>
            <Link
              className="flex items-center"
              href={`/transactions?categories=${category.slug}&start=${formatISO(new Date(selectedPeriod.from), { representation: "date" })}&end=${formatISO(new Date(selectedPeriod.to), { representation: "date" })}`}
            >
              <CategoryBadge category={category} />

              <SpendingCategoryItem
                amount={category.amount}
                currency={category.currency}
                percentage={category.percentage}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
