"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { useTransactionFilterParams } from "~/hooks/use-transaction-filter-params";
import { useTransactionFilterParamsWithPersistence } from "~/hooks/use-transaction-filter-params-with-persistence";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { formatISO } from "date-fns";
import {
  CalendarIcon,
  EuroIcon,
  FilterIcon,
  LandmarkIcon,
  Repeat1Icon,
  SearchIcon,
  ShapesIcon,
  TagsIcon,
} from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

import { FilterList } from "./filter-list";
import { TransactionAccountFilter } from "./transaction-account-filter";
import { TransactionAmountFilter } from "./transaction-amount-filter";
import { TransactionCategoryFilter } from "./transaction-category-filter";
import { TransactionTagFilter } from "./transaction-tag-filter";

type StatusFilter = "completed" | "uncompleted" | "archived" | "excluded";
type AttachmentFilter = "include" | "exclude";
type RecurringFilter = "all" | "weekly" | "monthly" | "annually";

interface BaseFilterItem {
  name: string;
}

interface FilterItem<T extends string> extends BaseFilterItem {
  id: T;
}

interface FilterMenuItemProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}

interface FilterCheckboxItemProps {
  id: string;
  name: string;
  checked?: boolean;
  className?: string;
  onCheckedChange: () => void;
}

// Static data
const defaultSearch = {
  q: null,
  attachments: null,
  start: null,
  end: null,
  categories: null,
  accounts: null,
  statuses: null,
  recurring: null,
  tags: null,
  amount_range: null,
};

const PLACEHOLDERS = [
  "Expenses last month",
  "Income last year",
  "From Google without receipt",
  "Search or filter",
  "Revolut this month",
];

const statusFilters: FilterItem<StatusFilter>[] = [
  { id: "completed", name: "Completed" },
  { id: "uncompleted", name: "Uncompleted" },
  { id: "archived", name: "Archived" },
  { id: "excluded", name: "Excluded" },
];

const attachmentsFilters: FilterItem<AttachmentFilter>[] = [
  { id: "include", name: "Has attachments" },
  { id: "exclude", name: "No attachments" },
];

const recurringFilters: FilterItem<RecurringFilter>[] = [
  { id: "all", name: "All recurring" },
  { id: "weekly", name: "Weekly recurring" },
  { id: "monthly", name: "Monthly recurring" },
  { id: "annually", name: "Annually recurring" },
];

// Reusable components
function FilterMenuItem({ icon: Icon, label, children }: FilterMenuItemProps) {
  return (
    <DropdownMenuGroup>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Icon className="mr-2 size-4" />
          <span>{label}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent
            sideOffset={14}
            alignOffset={-4}
            className="p-0"
          >
            {children}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  );
}

function FilterCheckboxItem({
  id,
  name,
  checked = false,
  onCheckedChange,
  className,
}: FilterCheckboxItemProps) {
  return (
    <DropdownMenuCheckboxItem
      key={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={className}
    >
      {name}
    </DropdownMenuCheckboxItem>
  );
}

function useFilterData(isOpen: boolean, isFocused: boolean) {
  const trpc = useTRPC();
  const { filter } = useTransactionFilterParams();

  const shouldFetch = isOpen || isFocused;

  const { data: tagsData } = useQuery({
    ...trpc.tag.get.queryOptions({}),
    enabled: shouldFetch || Boolean(filter.tags?.length),
  });

  const { data: bankAccountsData } = useQuery({
    ...trpc.bankAccount.get.queryOptions({}),
    enabled: shouldFetch || Boolean(filter.accounts?.length),
  });

  // We want to fetch the categories data on mount
  const { data: categoriesData } = useQuery({
    ...trpc.transactionCategory.get.queryOptions(),
  });

  return {
    tags: tagsData?.map((tag) => ({
      id: tag.id,
      text: tag.text,
    })),
    accounts: bankAccountsData?.map((bankAccount) => ({
      id: bankAccount.id,
      name: bankAccount.name ?? "",
      currency: bankAccount.currency ?? "",
    })),
    categories: categoriesData?.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    })),
  };
}

function updateArrayFilter(
  value: string,
  currentValues: string[] | null | undefined,
  setFilter: (update: Record<string, unknown>) => void,
  key: string,
) {
  const normalizedValues = currentValues ?? null;
  const newValues = normalizedValues?.includes(value)
    ? normalizedValues.filter((v) => v !== value).length > 0
      ? normalizedValues.filter((v) => v !== value)
      : null
    : [...(normalizedValues ?? []), value];

  setFilter({ [key]: newValues });
}

export function TransactionsSearchFilter() {
  const [placeholder, setPlaceholder] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [streaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { filter = defaultSearch, setFilter } =
    useTransactionFilterParamsWithPersistence();
  const { tags, accounts, categories } = useFilterData(isOpen, isFocused);
  const [prompt, setPrompt] = useState(filter.q ?? "");

  useEffect(() => {
    const randomPlaceholder =
      PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)] ??
      "Search or filter";

    setPlaceholder(randomPlaceholder);
  }, []);

  useHotkeys(
    "esc",
    () => {
      setPrompt("");
      setFilter(defaultSearch);
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
      setFilter(defaultSearch);
      setPrompt("");
    }
  };

  const handleSubmit = async () => {
    // TODO: add AI filtering @ref: midday
    setFilter({ q: prompt.length > 0 ? prompt : null });
  };

  const validFilters = Object.fromEntries(
    Object.entries(filter).filter(([key]) => key !== "q"),
  );

  const hasValidFilters = Object.values(validFilters).some(
    (value) => value !== null,
  );

  const processFiltersForList = () => {
    return Object.fromEntries(
      Object.entries({
        ...validFilters,
        start: filter.start ?? undefined,
        end: filter.end ?? undefined,
        amount_range: filter.amount_range
          ? `${filter.amount_range[0]}-${filter.amount_range[1]}`
          : undefined,
        attachments: filter.attachments ?? undefined,
        categories: filter.categories ?? undefined,
        tags: filter.tags ?? undefined,
        accounts: filter.accounts ?? undefined,
        statuses: filter.statuses ?? undefined,
        recurring: filter.recurring ?? undefined,
      }).filter(([_, value]) => value !== undefined && value !== null),
    );
  };

  const getAmountRange = () => {
    if (
      !filter.amount_range ||
      !Array.isArray(filter.amount_range) ||
      filter.amount_range.length < 2
    ) {
      return undefined;
    }
    return [filter.amount_range[0], filter.amount_range[1]] as [number, number];
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex w-full flex-col items-stretch space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <form
          className="relative flex-1 sm:flex-initial"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <SearchIcon className="pointer-events-none absolute top-[11px] left-3 size-4" />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            className="w-full pr-8 pl-9 sm:w-[350px]"
            value={prompt}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
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
          filters={processFiltersForList()}
          loading={streaming}
          onRemove={setFilter}
          categories={categories}
          accounts={accounts}
          statusFilters={statusFilters}
          attachmentsFilters={attachmentsFilters}
          tags={tags}
          recurringFilters={recurringFilters}
          amountRange={getAmountRange()}
        />
      </div>

      <DropdownMenuContent
        className="w-[350px]"
        align="end"
        sideOffset={19}
        alignOffset={-11}
        side="top"
      >
        <FilterMenuItem icon={CalendarIcon} label="Date">
          <Calendar
            mode="range"
            autoFocus
            // toDate={new Date()}
            hidden={{ after: new Date() }}
            selected={{
              from: filter.start ? new Date(filter.start) : undefined,
              to: filter.end ? new Date(filter.end) : undefined,
            }}
            onSelect={(range) => {
              if (!range) return;

              const newRange = {
                start: range.from
                  ? formatISO(range.from, { representation: "date" })
                  : null,
                end: range.to
                  ? formatISO(range.to, { representation: "date" })
                  : null,
              };

              setFilter(newRange);
            }}
          />
        </FilterMenuItem>

        <FilterMenuItem icon={EuroIcon} label="Amount">
          <div className="w-[280px] p-4">
            <TransactionAmountFilter />
          </div>
        </FilterMenuItem>

        <FilterMenuItem icon={ShapesIcon} label="Categories">
          <div className="max-h-[280px] w-[250px]">
            <TransactionCategoryFilter
              selected={filter.categories}
              onChange={(selected) =>
                updateArrayFilter(
                  selected,
                  filter.categories,
                  setFilter,
                  "categories",
                )
              }
            />
          </div>
        </FilterMenuItem>

        <FilterMenuItem icon={TagsIcon} label="Tags">
          <div className="max-h-[280px] w-[250px]">
            <TransactionTagFilter
              selected={filter.tags}
              onChange={(selected) =>
                updateArrayFilter(selected, filter.tags, setFilter, "tags")
              }
            />
          </div>
        </FilterMenuItem>

        <FilterMenuItem icon={LandmarkIcon} label="Accounts">
          <div className="max-h-[280px] w-[250px]">
            <TransactionAccountFilter
              selected={filter.accounts}
              onChange={(selected) =>
                updateArrayFilter(
                  selected,
                  filter.accounts,
                  setFilter,
                  "accounts",
                )
              }
            />
          </div>
        </FilterMenuItem>

        <FilterMenuItem icon={Repeat1Icon} label="Recurring">
          {recurringFilters.map(({ id, name }) => (
            <FilterCheckboxItem
              key={id}
              id={id}
              name={name}
              checked={filter?.recurring?.includes(id)}
              onCheckedChange={() =>
                updateArrayFilter(id, filter.recurring, setFilter, "recurring")
              }
            />
          ))}
        </FilterMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
