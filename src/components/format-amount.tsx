"use client";

import { formatAmount } from "~/shared/helpers/format";

type Props = {
  amount: number;
  currency: string;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  locale?: string;
};

export function FormatAmount({
  amount,
  currency,
  maximumFractionDigits,
  minimumFractionDigits,
  locale,
}: Props) {
  //   const { data: user } = useUserQuery();

  return formatAmount({
    locale: locale, // || user?.locale,
    amount: amount,
    currency,
    maximumFractionDigits,
    minimumFractionDigits,
  });
}
