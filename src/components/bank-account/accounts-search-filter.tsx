"use client";

import { useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { useBankAccountFilterParams } from "~/hooks/use-bank-account-filter-params";
import { SearchIcon } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

// Static data
const defaultSearch = {
  q: null,
};

export function AccountsSearchFilter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { filters = defaultSearch, setFilters } = useBankAccountFilterParams();
  const [prompt, setPrompt] = useState(filters.q ?? "");

  useHotkeys(
    "esc",
    () => {
      setPrompt("");
      void setFilters(defaultSearch);
    },
    {
      enableOnFormTags: true,
      enabled: Boolean(prompt) && isFocused,
    },
  );

  useHotkeys("meta+s", (evt) => {
    evt.preventDefault();
    inputRef.current?.focus();
  });

  const handleSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    if (value) {
      setPrompt(value);
    } else {
      void setFilters(defaultSearch);
      setPrompt("");
    }
  };

  const handleSubmit = async () => {
    // TODO: add AI filtering @ref: midday
    void setFilters({ q: prompt.length > 0 ? prompt : null });
  };

  return (
    <div className="flex min-w-[250px] flex-col items-stretch space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
      <form
        className="relative flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <SearchIcon className="pointer-events-none absolute top-[11px] left-3 size-4" />
        <Input
          ref={inputRef}
          placeholder="Search accounts by name"
          className="w-full pr-8 pl-9"
          value={prompt}
          onChange={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
}
