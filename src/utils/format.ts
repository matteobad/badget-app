export function formatSize(bytes: number): string {
  const units = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];

  const unitIndex = Math.max(
    0,
    Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1),
  );

  return Intl.NumberFormat("it-IT", {
    style: "unit",
    unit: units[unitIndex],
  }).format(+Math.round(bytes / 1024 ** unitIndex));
}

type FormatAmountParams = Intl.NumberFormatOptions & {
  amount: number;
  locale?: Intl.LocalesArgument;
};

export function formatAmount({
  amount,
  currency = "EUR",
  locale = "it-IT",
  minimumFractionDigits,
  maximumFractionDigits,
}: FormatAmountParams) {
  if (!currency) {
    return;
  }

  return Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

export function formatPerc(value: number) {
  return Intl.NumberFormat("it-IT", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);
}
