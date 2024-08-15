import { format } from "date-fns";
import { motion } from "framer-motion";
import { CircleXIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

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

type Props = {
  filters: Record<string, string | number | boolean | string[] | number[]>;
  loading: boolean;
  onRemove: (key: string) => void;
  categories?: { id: string; name: string; slug: string }[];
  accounts?: { id: string; name: string; currency: string }[];
  members?: { id: string; name: string }[];
  statusFilters: { id: string; name: string }[];
  attachmentsFilters: { id: string; name: string }[];
};

export function FilterList({
  filters,
  loading,
  onRemove,
  categories,
  accounts,
  members,
  statusFilters,
  attachmentsFilters,
}: Props) {
  const renderFilter = ({ key, value }) => {
    switch (key) {
      case "start": {
        if (key === "start" && value && filters.end) {
          return `${format(new Date(value), "MMM d, yyyy")} - ${format(
            new Date(filters.end),
            "MMM d, yyyy",
          )}`;
        }

        return (
          key === "start" && value && format(new Date(value), "MMM d, yyyy")
        );
      }

      case "attachments": {
        return attachmentsFilters?.find((filter) => filter.id === value)?.name;
      }

      case "statuses": {
        return value
          .map(
            (status) =>
              statusFilters.find((filter) => filter.id === status)?.name,
          )
          .join(", ");
      }

      case "categories": {
        return value
          .map(
            (slug) =>
              categories?.find((category) => category.slug === slug)?.name,
          )
          .join(", ");
      }

      case "accounts": {
        return value
          .map((id) => {
            const account = accounts?.find((account) => account.id === id);
            return `${account.name} (${account.currency})`;
          })
          .join(", ");
      }

      case "assignees": {
        return value
          .map((id) => {
            const member = members?.find((member) => member.id === id);
            return member?.name;
          })
          .join(", ");
      }

      case "q":
        return value;

      default:
        return null;
    }
  };

  const handleOnRemove = (key: string) => {
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
            <Skeleton className="h-8 w-[100px] rounded-full" />
          </motion.li>
          <motion.li key="1" variants={itemVariant}>
            <Skeleton className="h-8 w-[100px] rounded-full" />
          </motion.li>
        </div>
      )}

      {!loading &&
        Object.entries(filters)
          .filter(([key, value]) => value !== null && key !== "end")
          .map(([key, value]) => {
            return (
              <motion.li key={key} variants={itemVariant}>
                <Button
                  className="group flex h-8 items-center space-x-1 rounded-full bg-secondary px-3 font-normal text-[#878787] hover:bg-secondary"
                  onClick={() => handleOnRemove(key)}
                >
                  <CircleXIcon className="w-0 scale-0 transition-all group-hover:w-4 group-hover:scale-100" />
                  <span>
                    {renderFilter({
                      key,
                      value,
                    })}
                  </span>
                </Button>
              </motion.li>
            );
          })}
    </motion.ul>
  );
}
