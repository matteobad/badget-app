"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const EU_COUNTRY_CODES = [
  // "AT",
  // "BE",
  // "BG",
  // "HR",
  // "CY",
  // "CZ",
  // "DK",
  // "EE",
  // "FI",
  // "FR",
  // "DE",
  // "GR",
  // "HU",
  // "IE",
  "IT",
  // "LV",
  // "LT",
  // "LU",
  // "MT",
  // "NL",
  // "PL",
  // "PT",
  // "RO",
  // "SK",
  // "SI",
  "ES",
  // "SE",
  // "GB",
  // "GI",
  // "IS",
  // "LI",
  // "NO",
  // "CH",
  // "ME",
  // "MK",
  // "RS",
  // "TR",
  // "AL",
  // "BA",
  // "XK",
  // "AD",
  // "BY",
  // "MD",
  // "MC",
  // "RU",
  // "UA",
  // "VA",
  // "AX",
  // "FO",
  // "GL",
  // "SJ",
  // "IM",
  // "JE",
  // "GG",
  // "RS",
  // "ME",
  // "XK",
  // "RS",
];

export function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    console.log(`Searching... ${term}`);

    const params = new URLSearchParams(searchParams);
    if (term && term.length > 3) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleCountryChange = useDebouncedCallback((countryCode: string) => {
    console.log(`filtering... ${countryCode}`);

    const params = new URLSearchParams(searchParams);
    if (countryCode) {
      params.set("country", countryCode);
    } else {
      params.delete("country");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-shrink-0">
      <Label htmlFor="search" className="sr-only">
        Search
      </Label>
      <Input
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        autoFocus
        className="peer block w-full rounded-md rounded-r-none border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
      />
      <Select
        onValueChange={handleCountryChange}
        defaultValue={searchParams.get("country")?.toString()}
      >
        <SelectTrigger className="w-20 rounded-l-none border-l-0">
          <SelectValue placeholder="IT" />
        </SelectTrigger>
        <SelectContent>
          {EU_COUNTRY_CODES.map((code) => {
            return (
              <SelectItem key={code} value={code}>
                {code}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <SearchIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
