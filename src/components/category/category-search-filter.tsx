"use client";

import { useRef, useState } from "react";
import { useCategoryFilterParams } from "~/hooks/use-category-filter-params";
import { SearchIcon } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

import { Input } from "../ui/input";

export function CategorySearchFilter() {
  const { filter, setFilter } = useCategoryFilterParams();

  const inputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState(filter.q ?? "");

  useHotkeys(
    "esc",
    () => {
      setPrompt("");
    },
    {
      enableOnFormTags: true,
      enabled: Boolean(prompt),
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
      setPrompt("");
    }
  };

  const handleSubmit = async () => {
    void setFilter({ q: prompt.length > 0 ? prompt : null });
  };

  return (
    <form
      className="relative flex-1 sm:flex-initial"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
    >
      <SearchIcon className="pointer-events-none absolute top-[11px] left-3 size-4" />

      <Input
        placeholder="Search categories..."
        className="w-full rounded-none pr-8 pl-9 sm:w-[250px]"
        value={prompt}
        onChange={handleSearch}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
      />
    </form>
  );
}
