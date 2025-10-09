import { format } from "date-fns";
import { motion } from "framer-motion";
import { formatDateRange } from "little-date";
import { XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { formatAccountName } from "~/shared/helpers/format";

const listVariant = {
  hidden: { y: 10, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.05,
      staggerChildren: 0.06,
    },
  },
};

const itemVariant = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

type FilterKey =
  | "start"
  | "end"
  | "amount_range"
  | "statuses"
  | "attachments"
  | "recurring"
  | "categories"
  | "tags"
  | "accounts"
  | "type"
  | "reports";

type FilterValue = {
  start: string;
  end: string;
  amount_range: string;
  statuses: string[];
  attachments: string;
  recurring: string[];
  categories: string[];
  tags: string[];
  accounts: string[];
  type: string;
  reports: string;
};

interface FilterValueProps {
  key: FilterKey;
  value: FilterValue[FilterKey];
}

interface Props {
  filters: Partial<FilterValue>;
  loading: boolean;
  onRemove: (filters: Record<string, null>) => void;
  categories?: { id: string; name: string; slug: string | null }[];
  accounts?: { id: string; name: string; currency: string }[];
  typeFilters?: { id: string; name: string }[];
  attachmentsFilters?: { id: string; name: string }[];
  recurringFilters?: { id: string; name: string }[];
  tags?: { id: string; text: string; slug?: string }[];
  amountRange?: [number, number];
  statusFilters?: { id: string; name: string }[];
  reportsFilters?: { id: string; name: string }[];
}

export function FilterList({
  filters,
  loading,
  onRemove,
  categories,
  accounts,
  tags,
  typeFilters,
  attachmentsFilters,
  recurringFilters,
  amountRange,
  reportsFilters,
}: Props) {
  const renderFilter = ({ key, value }: FilterValueProps) => {
    switch (key) {
      case "start": {
        const startValue = value as FilterValue["start"];
        if (startValue && filters.end) {
          return formatDateRange(new Date(startValue), new Date(filters.end), {
            includeTime: false,
          });
        }

        return startValue && format(new Date(startValue), "MMM d, yyyy");
      }

      case "amount_range": {
        return `${amountRange?.[0]?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} - ${amountRange?.[1]?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }

      case "reports": {
        const reportValue = value as FilterValue["reports"];
        return reportsFilters?.find((filter) => filter.id === reportValue)
          ?.name;
      }

      case "attachments": {
        const attachmentValue = value as FilterValue["attachments"];
        return attachmentsFilters?.find(
          (filter) => filter.id === attachmentValue,
        )?.name;
      }

      case "recurring": {
        const recurringValue = value as FilterValue["recurring"];
        return recurringValue
          ?.map(
            (slug) =>
              recurringFilters?.find((filter) => filter.id === slug)?.name,
          )
          .join(", ");
      }

      case "type": {
        const typeValue = value as FilterValue["type"];
        if (!typeValue) return null;
        return typeFilters?.find((filter) => filter.id === typeValue)?.name;
      }

      case "categories": {
        const categoriesValue = value as FilterValue["categories"];
        if (!categoriesValue) return null;
        return categoriesValue
          .map(
            (slug) =>
              categories?.find((category) => category.slug === slug)?.name,
          )
          .join(", ");
      }

      case "tags": {
        const tagsValue = value as FilterValue["tags"];
        if (!tagsValue) return null;
        return tagsValue
          .map((id) => tags?.find((tag) => tag?.id === id)?.text)
          .join(", ");
      }

      case "accounts": {
        const accountsValue = value as FilterValue["accounts"];
        if (!accountsValue) return null;
        return accountsValue
          .map((id) => {
            const account = accounts?.find((account) => account.id === id);
            return formatAccountName({
              name: account?.name,
              currency: account?.currency,
            });
          })
          .join(", ");
      }

      default:
        return null;
    }
  };

  const handleOnRemove = (key: FilterKey) => {
    if (key === "start" || key === "end") {
      onRemove({ start: null, end: null });
      return;
    }

    onRemove({ [key]: null });
  };

  return (
    <motion.ul
      variants={listVariant}
      initial="hidden"
      animate="show"
      className="flex space-x-2"
    >
      {loading && (
        <div className="flex space-x-2">
          <motion.li key="1" variants={itemVariant}>
            <Skeleton className="h-8 w-[100px]" />
          </motion.li>
          <motion.li key="2" variants={itemVariant}>
            <Skeleton className="h-8 w-[100px]" />
          </motion.li>
        </div>
      )}

      {!loading &&
        Object.entries(filters)
          .filter(([key, value]) => value !== null && key !== "end")
          .map(([key, value]) => {
            const filterKey = key as FilterKey;
            return (
              <motion.li key={key} variants={itemVariant}>
                <Button
                  className="group flex h-9 items-center space-x-1 rounded-none bg-secondary px-2 font-normal text-[#878787] hover:bg-secondary"
                  onClick={() => handleOnRemove(filterKey)}
                >
                  <XIcon className="size-0 scale-0 transition-all group-hover:size-4 group-hover:scale-100" />
                  <span>
                    {renderFilter({
                      key: filterKey,
                      value: value,
                    })}
                  </span>
                </Button>
              </motion.li>
            );
          })}
    </motion.ul>
  );
}
