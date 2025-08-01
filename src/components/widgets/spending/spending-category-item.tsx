"use client";

import { formatAmount } from "~/utils/format";

type Props = {
  amount: number;
  currency: string;
  percentage: number;
};

export function SpendingCategoryItem({ amount, currency, percentage }: Props) {
  return (
    <div className="ml-auto flex items-center justify-between space-x-12 px-3 py-1">
      <div className="flex items-center space-x-2 text-sm font-medium">
        <p>
          {amount &&
            formatAmount({
              amount: amount,
              currency,
              maximumFractionDigits: 0,
              minimumFractionDigits: 0,
            })}
        </p>
      </div>

      <p className="truncate text-sm text-[#606060]">{percentage}%</p>
    </div>
  );
}
