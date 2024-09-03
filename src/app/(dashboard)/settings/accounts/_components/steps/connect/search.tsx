"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    console.log(`Searching... ${term}`);

    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
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
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => {
          console.log("change");
          handleSearch(e.target.value);
        }}
      />
      <SearchIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
