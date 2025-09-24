"use client";

import { formatAmount } from "~/shared/helpers/format";

type Props = {
  amount: number;
  currency: string;
  percentage: number;
};

export function SpendingCategoryItem({ amount, currency, percentage }: Props) {
  return (
    <div className="ml-auto flex items-baseline justify-between space-x-4 py-1 pl-3">
      <p className="font-medium">
        {amount &&
          formatAmount({
            amount: amount,
            currency,
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          })}
      </p>

      <p className="w-[40px] truncate text-right text-xs text-[#606060]">
        {Math.round(percentage)}%
      </p>
    </div>
  );
}
