import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { type Column, type Table } from "@tanstack/react-table";
import {
  CalendarIcon,
  ChartNoAxesColumnIcon,
  FilterIcon,
  LandmarkIcon,
  ListFilterIcon,
  ShapesIcon,
  TagIcon,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { cn } from "~/lib/utils";
import {
  type DataTableAdvancedFilterField,
  type Option,
} from "~/utils/data-table";
import Component from "../comp-265";
import { Calendar } from "../ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

function MultiSelectFilter<TData, TValue>({
  column,
  options,
  setOpen,
}: {
  column: Column<TData, TValue>;
  options: Option[];
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const unknownValue = column?.getFilterValue();
  const selectedValues = new Set(
    Array.isArray(unknownValue) ? unknownValue : [],
  );

  return (
    <Command>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {options.map((option) => {
            const isSelected = selectedValues.has(option.value);

            return (
              <CommandItem
                className="group flex items-center gap-2 text-muted-foreground"
                key={option.value}
                value={option.value}
                onSelect={() => {
                  if (isSelected) {
                    selectedValues.delete(option.value);
                  } else {
                    selectedValues.add(option.value);
                  }
                  const filterValues = Array.from(selectedValues);
                  column?.setFilterValue(
                    filterValues.length ? filterValues : undefined,
                  );

                  setOpen(false);
                }}
              >
                {
                  // @ts-expect-error should type this better
                  <option.icon />
                }
                <span className="text-accent-foreground">{option.label}</span>
                {option.label && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {option.count}
                  </span>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function DateFilter<TData, TValue>({
  column,
}: {
  column: Column<TData, TValue>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Calendar
      initialFocus
      mode="range"
      defaultMonth={new Date()}
      // selected={date}
      onSelect={(value) => {
        // TODO: aply filter
        if (!value) return;
        column.setFilterValue({
          from: value.from?.toISOString() ?? "",
          to: value.to?.toISOString() ?? "",
        });
      }}
      numberOfMonths={1}
    />
  );
}

const getFilterIcon = (filterId: string) => {
  switch (filterId) {
    case "date":
      return <CalendarIcon className="mr-1 size-3 text-muted-foreground" />;
    case "amount":
      return (
        <ChartNoAxesColumnIcon className="mr-1 size-3 text-muted-foreground" />
      );
    case "category":
      return <ShapesIcon className="mr-1 size-3 text-muted-foreground" />;
    case "tags":
      return <TagIcon className="mr-1 size-3 text-muted-foreground" />;
    case "account":
      return <LandmarkIcon className="mr-1 size-3 text-muted-foreground" />;
    default:
      return <FilterIcon />;
  }
};

interface DataTableFiltersProps<TData> {
  table: Table<TData>;
  filterableColumns: DataTableAdvancedFilterField<TData>[];
}

export function DataTableFilters<TData>({
  table,
  filterableColumns,
}: DataTableFiltersProps<TData>) {
  const [open, setOpen] = useState(false);

  // const [filters, setFilters] = useQueryState(
  //   "filters",
  //   getFiltersStateParser(table.getRowModel().rows[0]?.original)
  //     .withDefault([])
  //     .withOptions({
  //       clearOnDefault: true,
  //       shallow: false,
  //     }),
  // );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className="absolute left-40 -translate-x-8 lg:left-64"
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
        className="w-40 lg:w-64"
      >
        {filterableColumns.map((filter) => {
          return (
            <DropdownMenuSub key={filter.id}>
              <DropdownMenuSubTrigger>
                {getFilterIcon(filter.id)}
                {filter.label}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent sideOffset={8} className="p-0">
                  {filter.type === "multi-select" && (
                    <MultiSelectFilter
                      column={table.getColumn(String(filter.id))!}
                      options={filter.options!}
                      setOpen={setOpen}
                    />
                  )}
                  {filter.type === "date" && (
                    <DateFilter
                      column={table.getColumn(String(filter.id))!}
                      setOpen={setOpen}
                    />
                  )}
                  {filter.type === "number" && <Component />}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
