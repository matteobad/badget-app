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
  | "categories"
  | "tags"
  | "accounts"
  | "type"
  | "start"
  | "end"
  | "recurring"
  | "amountRange"
  | "manual"
  | "reporting";

type FilterValue = {
  categories: string[];
  tags: string[];
  accounts: string[];
  type: string;
  start: string;
  end: string;
  amountRange: string;
  recurring: string[];
  manual: string;
  reporting: string;
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
  tags?: { id: string; text: string; slug?: string }[];
  accounts?: { id: string; name: string; currency: string }[];
  typeFilters?: { id: string; name: string }[];
  recurringFilters?: { id: string; name: string }[];
  amountRange?: [number, number];
  manualFilters?: { id: string; name: string }[];
  reportingFilters?: { id: string; name: string }[];
}

export function FilterList({
  filters,
  loading,
  onRemove,
  categories,
  tags,
  accounts,
  typeFilters,
  recurringFilters,
  amountRange,
  manualFilters,
  reportingFilters,
}: Props) {
  const renderFilter = ({ key, value }: FilterValueProps) => {
    switch (key) {
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

      case "type": {
        const typeValue = value as FilterValue["type"];
        if (!typeValue) return null;
        return typeFilters?.find((filter) => filter.id === typeValue)?.name;
      }

      case "start": {
        const startValue = value as FilterValue["start"];
        if (startValue && filters.end) {
          return formatDateRange(new Date(startValue), new Date(filters.end), {
            includeTime: false,
          });
        }

        return startValue && format(new Date(startValue), "MMM d, yyyy");
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

      case "amountRange": {
        return `${amountRange?.[0]?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} - ${amountRange?.[1]?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }

      case "manual": {
        const manualValue = value as FilterValue["manual"];
        return manualFilters?.find((filter) => filter.id === manualValue)?.name;
      }

      case "reporting": {
        const reportValue = value as FilterValue["reporting"];
        return reportingFilters?.find((filter) => filter.id === reportValue)
          ?.name;
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
