"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDocumentFilterParams } from "~/hooks/use-document-filter-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { formatISO } from "date-fns";
import { CalendarIcon, FilterIcon, SearchIcon, TagIcon } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

import { FilterList } from "../transaction/filters/filter-list";
import { Calendar } from "../ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

export function VaultSearchFilter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [streaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const trpc = useTRPC();

  const { filter, setFilter } = useDocumentFilterParams();
  const [prompt, setPrompt] = useState(filter.q ?? "");

  const shouldFetch = isOpen;

  const { data: tagsData } = useQuery({
    ...trpc.documentTags.get.queryOptions(),
    enabled: shouldFetch || Boolean(filter.tags?.length),
  });

  useHotkeys(
    "esc",
    () => {
      setPrompt("");
      void setFilter(null);
      setIsOpen(false);
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
      void setFilter(null);
      setPrompt("");
    }
  };

  const handleSubmit = async () => {
    // If the user is typing a query with multiple words, we want to stream the results
    // if (prompt.split(" ").length > 1) {
    //   setStreaming(true);

    //   const { object } = await generateVaultFilters(prompt);

    //   let finalObject = {};

    //   for await (const partialObject of readStreamableValue(object)) {
    //     if (partialObject) {
    //       finalObject = {
    //         ...finalObject,
    //         ...partialObject,
    //         start: partialObject?.start ?? null,
    //         end: partialObject?.end ?? null,
    //         q: partialObject?.name ?? null,
    //       };
    //     }
    //   }

    //   setFilter({
    //     q: null,
    //     ...finalObject,
    //   });

    //   setStreaming(false);
    // } else {
    void setFilter({ q: prompt.length > 0 ? prompt : null });
    // }
  };

  const validFilters = Object.fromEntries(
    Object.entries(filter).filter(([key]) => key !== "q"),
  );

  const hasValidFilters = Object.values(validFilters).some(
    (value) => value !== null,
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center space-x-4">
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <SearchIcon className="pointer-events-none absolute top-[11px] left-3 size-4" />
          <Input
            ref={inputRef}
            placeholder="Search or type filter"
            className="w-full pr-8 pl-9 md:w-[350px]"
            value={prompt}
            onChange={handleSearch}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          <DropdownMenuTrigger asChild>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              type="button"
              className={cn(
                "absolute top-[10px] right-3 z-10 opacity-50 transition-opacity duration-300 hover:opacity-100",
                hasValidFilters && "opacity-100",
                isOpen && "opacity-100",
              )}
            >
              <FilterIcon className="size-4" />
            </button>
          </DropdownMenuTrigger>
        </form>

        <FilterList
          filters={validFilters}
          loading={streaming}
          onRemove={setFilter}
          tags={tagsData?.map((t) => ({ ...t, text: t.name })) ?? []}
        />
      </div>

      <DropdownMenuContent
        className="w-[350px]"
        align="end"
        sideOffset={19}
        alignOffset={-11}
        side="bottom"
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Date</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                <Calendar
                  mode="range"
                  initialFocus
                  toDate={new Date()}
                  selected={
                    filter.start || filter.end
                      ? {
                          from: filter.start
                            ? new Date(filter.start)
                            : undefined,
                          to: filter.end ? new Date(filter.end) : undefined,
                        }
                      : undefined
                  }
                  onSelect={(range) => {
                    if (!range) return;

                    const newRange = {
                      start: range.from
                        ? formatISO(range.from, { representation: "date" })
                        : filter.start,
                      end: range.to
                        ? formatISO(range.to, { representation: "date" })
                        : filter.end,
                    };

                    void setFilter(newRange);
                  }}
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <TagIcon className="mr-2 h-4 w-4" />
              <span>Tags</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="max-h-[300px] overflow-y-auto p-0"
              >
                {tagsData?.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag.id}
                    onCheckedChange={() => {
                      void setFilter({
                        tags: filter?.tags?.includes(tag.id)
                          ? filter.tags.filter((s) => s !== tag.id)
                          : [...(filter?.tags ?? []), tag.id],
                      });
                    }}
                  >
                    {tag.name}
                  </DropdownMenuCheckboxItem>
                ))}

                {!tagsData?.length && (
                  <DropdownMenuItem disabled>No tags found</DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
