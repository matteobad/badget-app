"use client";

import { useRef, useState } from "react";
import { formatISO } from "date-fns";
import {
  CalendarIcon,
  FilterIcon,
  LandmarkIcon,
  PaperclipIcon,
  SearchIcon,
  ShapesIcon,
  SwatchBookIcon,
} from "lucide-react";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

import { Calendar } from "~/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { FilterList } from "./filter-list";
import { SelectCategory } from "./select-category";

type Props = {
  placeholder: string;
  validFilters: string[];
  categories?: {
    id: string;
    slug: string;
    name: string;
  }[];
  accounts?: {
    id: string;
    name: string;
    currency: string;
  }[];
  members?: {
    id: string;
    name: string;
  }[];
};

const defaultSearch = {
  q: null,
  attachments: null,
  start: null,
  end: null,
  categories: null,
  accounts: null,
  assignees: null,
  statuses: null,
};

const statusFilters = [
  { id: "fullfilled", name: "Fulfilled" },
  { id: "unfulfilled", name: "Unfulfilled" },
  { id: "excluded", name: "Excluded" },
];

const attachmentsFilters = [
  { id: "include", name: "Has attachments" },
  { id: "exclude", name: "No attachments" },
];

const PLACEHOLDERS = [
  "Software and taxes last month",
  "Income last year",
  "Software last Q4",
  "From Google without receipt",
  "Search or filter",
  "Without receipts this month",
];

const placeholder =
  PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];

export function TransactionsSearchFilter({
  categories,
  accounts,
  members,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useQueryStates(
    {
      q: parseAsString,
      attachments: parseAsStringLiteral(["exclude", "include"] as const),
      start: parseAsString,
      end: parseAsString,
      categories: parseAsArrayOf(parseAsString),
      accounts: parseAsArrayOf(parseAsString),
      assignees: parseAsArrayOf(parseAsString),
      statuses: parseAsArrayOf(
        parseAsStringLiteral([
          "fullfilled",
          "unfulfilled",
          "excluded",
        ] as const),
      ),
    },
    {
      shallow: false,
    },
  );

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
    // TODO: handle search
  };

  const hasValidFilters =
    Object.entries(filters).filter(
      ([key, value]) => value !== null && key !== "q",
    ).length > 0;

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
          <SearchIcon className="pointer-events-none absolute left-3 top-[11px]" />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            className="w-full pl-9 pr-8 md:w-[350px]"
            value={prompt}
            onChange={handleSearch}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />

          <DropdownMenuTrigger asChild>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              type="button"
              className={cn(
                "absolute right-3 top-[10px] z-10 opacity-50 transition-opacity duration-300 hover:opacity-100",
                hasValidFilters && "opacity-100",
                isOpen && "opacity-100",
              )}
            >
              <FilterIcon />
            </button>
          </DropdownMenuTrigger>
        </form>

        <FilterList
          filters={filters}
          loading={false}
          onRemove={setFilters}
          categories={categories}
          accounts={accounts}
          members={members}
          statusFilters={statusFilters}
          attachmentsFilters={attachmentsFilters}
        />
      </div>

      <DropdownMenuContent
        className="w-[350px]"
        align="end"
        sideOffset={19}
        alignOffset={-11}
        side="top"
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
                  today={filters.start ? new Date(filters.start) : new Date()}
                  toDate={new Date()}
                  selected={{
                    from: filters.start ? new Date(filters.start) : undefined,
                    to: filters.end ? new Date(filters.end) : undefined,
                  }}
                  onSelect={({ from, to }) => {
                    void setFilters({
                      start: from
                        ? formatISO(from, { representation: "date" })
                        : null,
                      end: to
                        ? formatISO(to, { representation: "date" })
                        : null,
                    });
                  }}
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SwatchBookIcon className="mr-2 h-4 w-4" />
              <span>Status</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {statusFilters.map(({ id, name }) => (
                  <DropdownMenuCheckboxItem
                    key={id}
                    checked={filters?.statuses?.includes(id)}
                    onCheckedChange={() => {
                      void setFilters({
                        statuses: filters?.statuses?.includes(id)
                          ? filters.statuses.filter((s) => s !== id).length > 0
                            ? filters.statuses.filter((s) => s !== id)
                            : null
                          : [...(filters?.statuses ?? []), id],
                      });
                    }}
                  >
                    {name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PaperclipIcon className="mr-2 h-4 w-4" />

              <span>Attachments</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {attachmentsFilters.map(({ id, name }) => (
                  <DropdownMenuCheckboxItem
                    key={id}
                    checked={filters?.attachments?.includes(id)}
                    onCheckedChange={() => {
                      void setFilters({
                        attachments: id,
                      });
                    }}
                  >
                    {name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ShapesIcon className="mr-2 h-4 w-4" />

              <span>Categories</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-101}
                className="h-[270px] w-[250px] p-0"
              >
                <SelectCategory
                  onChange={(selected) => {
                    void setFilters({
                      categories: filters?.categories?.includes(selected.slug)
                        ? filters.categories.filter((s) => s !== selected.slug)
                            .length > 0
                          ? filters.categories.filter(
                              (s) => s !== selected.slug,
                            )
                          : null
                        : [...(filters?.categories ?? []), selected.slug],
                    });
                  }}
                  headless
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <LandmarkIcon className="mr-2 h-4 w-4" />

              <span>Accounts</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {accounts?.map((account) => (
                  <DropdownMenuCheckboxItem
                    key={account.id}
                    onCheckedChange={() => {
                      voidsetFilters({
                        accounts: filters?.accounts?.includes(account.id)
                          ? filters.accounts.filter((s) => s !== account.id)
                              .length > 0
                            ? filters.accounts.filter((s) => s !== account.id)
                            : null
                          : [...(filters?.accounts ?? []), account.id],
                      });
                    }}
                  >
                    {account.name} ({account.currency})
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
