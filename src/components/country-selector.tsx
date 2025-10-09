import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";
import { useEffect } from "react";
import { cn } from "~/lib/utils";
import { countryFlags } from "~/shared/constants/countries";

import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type Props = {
  defaultValue: string;
  onSelect: (countryCode: string, countryName: string) => void;
  className?: string;
  align?: "start" | "end" | "center";
};

export function CountrySelector({
  defaultValue,
  onSelect,
  className,
  align,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue);
  const [inputValue, setInputValue] = React.useState("");

  useEffect(() => {
    if (value !== defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue, value]);

  const items = Object.values(countryFlags);

  const selected = Object.values(countryFlags).find(
    (country) => country.code === value || country.name === value,
  );

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className="w-full justify-between truncate font-normal"
        >
          {value ? selected?.name : "Select country"}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-(--radix-popover-trigger-width) p-0", className)}
        align={align}
      >
        <Command loop shouldFilter={false}>
          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            placeholder="Search country..."
            className="px-3"
            autoComplete="off"
          />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup>
            <CommandList className="max-h-[230px] overflow-y-auto">
              {filteredItems.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  className={cn("cursor-pointer")}
                  onSelect={() => {
                    setValue(country.code);
                    onSelect?.(country.code, country.name);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === country.code ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {country.name}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
