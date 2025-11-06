"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import { formatISO } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  CalendarIcon,
  ChartSplineIcon,
  EuroIcon,
  FilterIcon,
  ImportIcon,
  LandmarkIcon,
  Repeat1Icon,
  SearchIcon,
  ShapesIcon,
  TagsIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { SelectCategory } from "~/components/transaction-category/select-category";
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
import type { TransactionFrequencyType } from "~/shared/constants/enum";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { generateTransactionFiltersSchema } from "~/shared/validators/transaction.schema";
import { FilterList } from "./filter-list";
import { TransactionAccountFilter } from "./transaction-account-filter";
import { TransactionAmountFilter } from "./transaction-amount-filter";
import { TransactionTagFilter } from "./transaction-tag-filter";

type TypeFilter = "income" | "expense";
type RecurringFilter = TransactionFrequencyType | "all";
type ManualFilter = "include" | "exclude";
type ReportingFilter = "include" | "exclude";

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
  categories: null,
  tags: null,
  accounts: null,
  type: null,
  start: null,
  end: null,
  recurring: null,
  amountRange: null,
  amount: null,
  manual: null,
  reporting: null,
};

const PLACEHOLDERS = [
  "Expenses last month",
  "Income last year",
  "From Google without receipt",
  "Search or filter",
  "Revolut this month",
];

const typeFilters: FilterItem<TypeFilter>[] = [
  { id: "income", name: "Income" },
  { id: "expense", name: "Expenses" },
];

const recurringFilters: FilterItem<RecurringFilter>[] = [
  { id: "all", name: "All recurring" },
  { id: "weekly", name: "Weekly recurring" },
  { id: "monthly", name: "Monthly recurring" },
  { id: "annually", name: "Annually recurring" },
];

const manualFilters: FilterItem<ManualFilter>[] = [
  { id: "include", name: "Manual" },
  { id: "exclude", name: "Bank connection" },
];

const reportingFilters: FilterItem<ReportingFilter>[] = [
  { id: "include", name: "Included in reports" },
  { id: "exclude", name: "Excluded from reports" },
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
    ...trpc.tag.get.queryOptions(),
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
      text: tag.name,
    })),
    accounts: bankAccountsData?.map((bankAccount) => ({
      id: bankAccount.id,
      name: bankAccount.name ?? "",
      currency: bankAccount.currency ?? "",
    })),
    categories: categoriesData?.flatMap((category) => [
      // Include parent category
      {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      // Include all child categories
      ...(category.children?.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
      })) || []),
    ]),
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
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { filter = defaultSearch, setFilter } =
    useTransactionFilterParamsWithPersistence();
  const { tags, accounts, categories } = useFilterData(isOpen, isFocused);
  const [prompt, setPrompt] = useState(filter.q ?? "");

  const {
    object,
    submit,
    isLoading: isStreaming,
  } = useObject({
    api: "/api/ai/generate-transaction-filters",
    schema: generateTransactionFiltersSchema,
  });

  useEffect(() => {
    const randomPlaceholder =
      PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)] ??
      "Search or filter";

    setPlaceholder(randomPlaceholder);
  }, []);

  useEffect(() => {
    if (object) {
      console.log(object);
      void setFilter({
        // q: null,
        ...defaultSearch,
        ...object,
        // @ts-expect-error find a way to better type this
        categories:
          object?.categories
            ?.map((name) => categories?.find((c) => c.name === name)?.slug)
            .filter(Boolean) ?? null,
        // @ts-expect-error find a way to better type this
        tags:
          object?.tags
            ?.map((name) => tags?.find((t) => t.text === name)?.id)
            .filter(Boolean) ?? null,
        // @ts-expect-error find a way to better type this
        recurring: object?.recurring ?? null,
        q: object?.name ?? null,
        // @ts-expect-error find a way to better type this
        amountRange: object?.amountRange ?? null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object]);

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
    if (prompt.split(" ").length > 1) {
      submit({
        prompt,
        context: `
          Categories: ${categories?.map((category) => category.name).join(", ")}
          Tags: ${tags?.map((tag) => tag.text).join(", ")}
        `,
      });
    } else {
      setFilter({ q: prompt.length > 0 ? prompt : null });
    }
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
        categories: filter.categories ?? undefined,
        tags: filter.tags ?? undefined,
        accounts: filter.accounts ?? undefined,
        type: filter.type ?? undefined,
        start: filter.start ?? undefined,
        end: filter.end ?? undefined,
        recurring: filter.recurring ?? undefined,
        amountRange: filter.amountRange
          ? `${filter.amountRange[0]}-${filter.amountRange[1]}`
          : undefined,
        amount: filter.amount
          ? `${filter.amount[0]}-${filter.amount[1]}`
          : undefined,
        manual: filter.manual ?? undefined,
        reporting: filter.reporting ?? undefined,
      }).filter(([_, value]) => value !== undefined && value !== null),
    );
  };

  const getAmountRange = () => {
    if (
      !filter.amountRange ||
      !Array.isArray(filter.amountRange) ||
      filter.amountRange.length < 2
    ) {
      return undefined;
    }
    return [filter.amountRange[0], filter.amountRange[1]] as [number, number];
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
          loading={isStreaming}
          onRemove={setFilter}
          categories={categories}
          tags={tags}
          accounts={accounts}
          typeFilters={typeFilters}
          recurringFilters={recurringFilters}
          amountRange={getAmountRange()}
          manualFilters={manualFilters}
          reportingFilters={reportingFilters}
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

              console.log({ newRange });
              setFilter(newRange);
            }}
          />
        </FilterMenuItem>

        <FilterMenuItem icon={EuroIcon} label="Amount">
          <div className="w-[280px] p-4">
            <TransactionAmountFilter />
          </div>
        </FilterMenuItem>

        <FilterMenuItem icon={ChartSplineIcon} label="Reports">
          <div className="max-h-[280px] w-[200px] p-1">
            {reportingFilters.map(({ id, name }) => (
              <FilterCheckboxItem
                key={id}
                id={id}
                name={name}
                checked={filter?.reporting === id}
                onCheckedChange={() => {
                  setFilter({
                    reporting: id,
                  });
                }}
              />
            ))}
          </div>
        </FilterMenuItem>

        <FilterMenuItem icon={ShapesIcon} label="Categories">
          <div className="h-[270px] w-[250px]">
            <SelectCategory
              headless
              onChange={(selected) =>
                updateArrayFilter(
                  selected.slug,
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
          <div className="max-h-[280px] w-[200px] p-1">
            {recurringFilters.map(({ id, name }) => (
              <FilterCheckboxItem
                key={id}
                id={id}
                name={name}
                checked={filter?.recurring?.includes(id)}
                onCheckedChange={() =>
                  updateArrayFilter(
                    id,
                    filter.recurring,
                    setFilter,
                    "recurring",
                  )
                }
              />
            ))}
          </div>
        </FilterMenuItem>

        <FilterMenuItem icon={ImportIcon} label="Source">
          {manualFilters.map(({ id, name }) => (
            <FilterCheckboxItem
              key={id}
              id={id}
              name={name}
              checked={filter?.manual === id}
              onCheckedChange={() => {
                setFilter({
                  manual: id,
                });
              }}
            />
          ))}
        </FilterMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
