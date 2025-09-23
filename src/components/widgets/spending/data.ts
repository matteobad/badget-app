import { getColorFromName } from "~/shared/helpers/categories";
import {
  endOfYear,
  formatISO,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";

export const SPENDING_PERIOD = {
  THIS_MONTH: "this_month",
  LAST_MONTH: "last_month",
  THIS_YEAR: "this_year",
  LAST_YEAR: "last_year",
} as const;

export type SpendingPeriodType =
  (typeof SPENDING_PERIOD)[keyof typeof SPENDING_PERIOD];

export const defaultPeriod = {
  id: "this_month",
  from: formatISO(startOfMonth(new Date()), { representation: "date" }),
  to: formatISO(new Date(), { representation: "date" }),
};

export const options = [
  defaultPeriod,
  {
    id: "last_month",
    from: formatISO(subMonths(startOfMonth(new Date()), 1), {
      representation: "date",
    }),
    to: formatISO(subDays(startOfMonth(new Date()), 1), {
      representation: "date",
    }),
  },
  {
    id: "this_year",
    from: formatISO(startOfYear(new Date()), { representation: "date" }),
    to: formatISO(endOfYear(new Date()), { representation: "date" }),
  },
  {
    id: "last_year",
    from: formatISO(subYears(startOfYear(new Date()), 1), {
      representation: "date",
    }),
    to: formatISO(subYears(endOfYear(new Date()), 1), {
      representation: "date",
    }),
  },
];

export const spendingExampleData = [
  {
    slug: "rent",
    color: getColorFromName("Rent") ?? "#FF6900",
    icon: "circle-dashed",
    name: "Rent",
    currency: "USD",
    amount: 0,
    percentage: 0,
  },
  {
    slug: "meals",
    color: getColorFromName("Meals") ?? "#FCB900",
    icon: "circle-dashed",
    name: "Meals",
    currency: "USD",
    amount: 0,
    percentage: 0,
  },
  {
    slug: "other",
    color: getColorFromName("Other") ?? "#00D084",
    icon: "circle-dashed",
    name: "Other",
    currency: "USD",
    amount: 0,
    percentage: 0,
  },
  {
    slug: "internet-and-telephone",
    color: getColorFromName("Internet and Telephone") ?? "#8ED1FC",
    icon: "circle-dashed",
    name: "Internet and Telephone",
    currency: "USD",
    amount: 0,
    percentage: 0,
  },
  {
    slug: "software",
    color: getColorFromName("Software") ?? "#EB144C",
    icon: "circle-dashed",
    name: "Software",
    currency: "USD",
    amount: 0,
    percentage: 0,
  },
  {
    slug: "equipment",
    color: getColorFromName("Equipment") ?? "#F78DA7",
    icon: "circle-dashed",
    name: "Equipment",
    currency: "USD",
    amount: 0,
    percentage: 0,
  },
  {
    slug: "office-supplies",
    color: getColorFromName("Office Supplies") ?? "#9900EF",
    icon: "circle-dashed",
    name: "Office Supplies",
    currency: "USD",
    amount: 0,
    percentage: 0,
  },
  {
    slug: "uncategorized",
    color: getColorFromName("Uncategorized") ?? "#0079BF",
    icon: "circle-dashed",
    name: "Uncategorized",
    currency: "USD",
    amount: 0,
    percentage: 0,
  },
  {
    slug: "fees",
    color: getColorFromName("Fees") ?? "#B6BBBF",
    icon: "circle-dashed",
    name: "Fees",
    currency: "USD",
    amount: 0,
    percentage: 0,
  },
  {
    slug: "travel",
    color: getColorFromName("Travel") ?? "#FF5A5F",
    icon: "circle-dashed",
    name: "Travel",
    currency: "USD",
    amount: 0,
    percentage: 0,
  },
];
