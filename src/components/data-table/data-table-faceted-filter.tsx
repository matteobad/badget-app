import type { Column } from "@tanstack/react-table";
import { XIcon } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { type Option } from "~/utils/data-table";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: Option[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const unknownValue = column?.getFilterValue();
  const selectedValues = new Set(
    Array.isArray(unknownValue) ? unknownValue : [],
  );

  return (
    selectedValues?.size > 0 && (
      <Badge
        variant="secondary"
        className="group rounded-sm p-1.5 px-2 font-normal"
        onClick={() => column?.setFilterValue(undefined)}
      >
        <span className="lg:hidden">
          {selectedValues.size} {title}
        </span>
        <span className="hidden lg:flex">
          {options
            .filter((option) => selectedValues.has(option.value))
            .map((option) => option.label)
            .join(", ")}
        </span>

        <XIcon className="" />
      </Badge>
    )
  );
}
