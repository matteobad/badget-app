import { type Column } from "@tanstack/react-table";
import { CheckIcon, XIcon } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import { cn } from "~/lib/utils";
import { type Option } from "~/utils/data-table";

export function MultiSelectFilter<TData, TValue>({
  column,
  options,
}: {
  column: Column<TData, TValue>;
  options: Option[];
}) {
  const unknownValue = column?.getFilterValue();
  const selectedValues = new Set(
    Array.isArray(unknownValue) ? unknownValue : [],
  );

  return (
    <Command>
      <CommandInput
        placeholder={column.id}
        className="placeholder:capitalize"
      />
      <CommandList className="max-h-full">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup className="max-h-[18.75rem] overflow-x-hidden overflow-y-auto">
          {options.map((option) => {
            const isSelected = selectedValues.has(option.value);

            return (
              <CommandItem
                key={option.value}
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
                }}
              >
                <div
                  className={cn(
                    "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50 [&_svg]:invisible",
                  )}
                >
                  <CheckIcon className="size-4" aria-hidden="true" />
                </div>
                {option.icon && (
                  <option.icon
                    className="mr-2 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                <span>{option.label}</span>
                {option.count && (
                  <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                    {option.count}
                  </span>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
        {selectedValues.size > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => column?.setFilterValue(undefined)}
                className="justify-center text-center"
              >
                Pulisci filtri
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
}

export function MultiSelectFaceted<TData, TValue>({
  column,
  options,
}: {
  column: Column<TData, TValue>;
  options: Option[];
}) {
  const unknownValue = column?.getFilterValue();
  const selectedValues = new Set(
    Array.isArray(unknownValue) ? unknownValue : [],
  );

  if (selectedValues?.size <= 0) return;

  return (
    <Badge
      variant="secondary"
      className="group rounded-sm p-1.5 px-2 font-normal"
      onClick={() => column?.setFilterValue(undefined)}
    >
      <span className="capitalize lg:hidden">
        {selectedValues.size} {column.id}
      </span>
      <span className="hidden lg:flex">
        {options
          .filter((option) => selectedValues.has(option.value))
          .map((option) => option.label)
          .join(", ")}
      </span>

      <XIcon className="" />
    </Badge>
  );
}
