import { useState } from "react";
import { type Table } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { type DataTableFilterField } from "~/utils/data-table";
import {
  CalendarIcon,
  ChartNoAxesColumnIcon,
  FilterIcon,
  LandmarkIcon,
  ListFilterIcon,
  ShapesIcon,
  TagIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DateFilter } from "./filters/date-filter";
import { MultiSelectFilter } from "./filters/multi-select-filter";
import NumberFilter from "./filters/number-filter";

const getFilterIcon = (filterId: string) => {
  switch (filterId) {
    case "date":
      return <CalendarIcon className="mr-1 size-3 text-muted-foreground" />;
    case "amount":
      return (
        <ChartNoAxesColumnIcon className="mr-1 size-3 text-muted-foreground" />
      );
    case "categoryId":
      return <ShapesIcon className="mr-1 size-3 text-muted-foreground" />;
    case "tags":
      return <TagIcon className="mr-1 size-3 text-muted-foreground" />;
    case "accountId":
      return <LandmarkIcon className="mr-1 size-3 text-muted-foreground" />;
    default:
      return <FilterIcon />;
  }
};

interface DataTableFiltersProps<TData> {
  table: Table<TData>;
  filterableColumns: DataTableFilterField<TData>[];
}

export function DataTableFilters<TData>({
  table,
  filterableColumns,
}: DataTableFiltersProps<TData>) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className="absolute left-44 -translate-x-8 lg:left-64"
      >
        <Button
          variant="ghost"
          aria-expanded={open}
          size="sm"
          className={cn(
            "group flex h-6 items-center gap-1.5 rounded-sm text-xs transition",
            filterableColumns.length > 0 && "w-6",
          )}
        >
          <ListFilterIcon className="size-3 shrink-0 text-muted-foreground transition-all group-hover:text-primary" />
          {!filterableColumns.length && "Filter"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        alignOffset={-8}
        className="w-44 lg:w-64"
      >
        {filterableColumns.map((filter) => {
          const column = table.getColumn(String(filter.id))!;
          const options = filter.options;

          return (
            <DropdownMenuSub key={filter.id}>
              <DropdownMenuSubTrigger>
                {getFilterIcon(filter.id)}
                {filter.label}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent sideOffset={8} className="p-0">
                  {filter.type === "multi-select" && (
                    <MultiSelectFilter column={column} options={options!} />
                  )}
                  {filter.type === "date" && <DateFilter column={column} />}
                  {filter.type === "number" && (
                    <NumberFilter column={column} data={table.options.data} />
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
