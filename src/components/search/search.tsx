"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDocumentParams } from "~/hooks/use-document-params";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { useUserQuery } from "~/hooks/use-user";
import { useSearchStore } from "~/lib/stores/search";
import { formatDate } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import {
  ArrowUpRightIcon,
  CloudDownloadIcon,
  CopyCheckIcon,
  CopyIcon,
  Layers2Icon,
  ReceiptIcon,
} from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { useCopyToClipboard, useDebounceValue } from "usehooks-ts";

import { FormatAmount } from "../format-amount";
import { Spinner } from "../load-more";
import { FilePreviewIcon } from "../transaction-attachment/file-preview-icon";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

interface SearchItem {
  id: string;
  type: string;
  title: string;
  data?: {
    name?: string;
    email?: string;
    invoice_number?: string;
    status?: string;
    amount?: number;
    currency?: string;
    date?: string;
    display_name?: string;
    file_name?: string;
    file_path?: string[];
    path_tokens?: string[];
    title?: string;
    metadata?: {
      mimetype?: string;
    };
    template?: {
      size?: string;
    };
    url?: string;
  };
  action?: () => void;
}

function CopyButton({ path }: { path: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const [, copy] = useCopyToClipboard();

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    void copy(`${window.location.origin}${path}`);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <button type="button" onClick={handleCopy}>
      {isCopied ? (
        <CopyCheckIcon className="size-4 cursor-pointer text-primary hover:!text-primary dark:text-[#666]" />
      ) : (
        <CopyIcon className="size-4 cursor-pointer text-primary hover:!text-primary dark:text-[#666]" />
      )}
    </button>
  );
}

function DownloadButton({
  href,
  filename,
}: {
  href: string;
  filename?: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setIsDownloading(true);
      //   TODO: await downloadFile(href, filename || "download");

      // Keep spinner for 1 second
      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error("Download failed:", error);
      setIsDownloading(false);
    }
  };

  return (
    <button type="button" onClick={handleDownload}>
      {isDownloading ? (
        <Spinner size={16} />
      ) : (
        <CloudDownloadIcon className="size-4 cursor-pointer text-primary hover:!text-primary dark:text-[#666]" />
      )}
    </button>
  );
}

// Helper function to format group names
const formatGroupName = (name: string): string | null => {
  switch (name) {
    case "shortcut":
      return "Shortcuts";
    case "vault":
      return "Vault";
    case "transaction":
      return "Transactions";

    default:
      return null;
  }
};

const useSearchNavigation = () => {
  const router = useRouter();
  const { setOpen } = useSearchStore();
  const { setParams: setTransactionParams } = useTransactionParams();
  const { setParams: setDocumentParams } = useDocumentParams();

  const navigateWithParams = (
    params: Record<string, any>,
    paramSetter: (params: any) => Promise<URLSearchParams>,
  ) => {
    setOpen();
    void paramSetter(params);
    return;
  };

  const navigateToPath = (path: string) => {
    setOpen();
    router.push(path);
    return;
  };

  return {
    navigateToDocument: (params: { documentId: string }) => {
      return navigateWithParams(params, setDocumentParams);
    },
    navigateToTransaction: (params: {
      transactionId?: string;
      createTransaction?: boolean;
    }) => {
      return navigateWithParams(params, setTransactionParams);
    },
    navigateToPath: (path: string) => {
      return navigateToPath(path);
    },
    // Action helpers
    createTransaction: () => {
      return navigateWithParams(
        { createTransaction: true },
        setTransactionParams,
      );
    },
  };
};

// Sub-component to render each search item
const SearchResultItemDisplay = ({
  item,
  dateFormat,
}: {
  item: SearchItem;
  dateFormat?: string;
}) => {
  const nav = useSearchNavigation();

  let icon: ReactNode | undefined;
  let resultDisplay: ReactNode;
  let onSelect: () => void;

  if (!item.data) {
    // This is an action item (e.g., "Create Invoice", "View Documents")
    icon = <Layers2Icon className="size-4 text-primary dark:text-[#666]" />;
    resultDisplay = item.title;
  } else {
    icon = null;
    resultDisplay = item.title;

    switch (item.type) {
      case "vault": {
        onSelect = () => nav.navigateToDocument({ documentId: item.id });

        icon = (
          <FilePreviewIcon
            mimetype={item.data?.metadata?.mimetype}
            className="size-4 text-primary dark:text-[#666]"
          />
        );
        resultDisplay = (
          <div className="flex w-full items-center justify-between">
            <span className="flex-grow truncate">
              {
                (item.data?.title ??
                  (item.data?.name as string)?.split("/").at(-1) ??
                  "") as string
              }
            </span>
            <div className="invisible flex items-center gap-2 group-hover/item:visible group-focus/item:visible group-aria-selected/item:visible">
              <CopyButton path={`?documentId=${item.id}`} />
              <DownloadButton
                href={`/api/download/file?path=${item.data?.path_tokens?.join("/")}&filename=${
                  (item.data?.title ??
                    (item.data?.name as string)?.split("/").at(-1) ??
                    "") as string
                }`}
                filename={
                  (item.data?.title ??
                    (item.data?.name as string)?.split("/").at(-1) ??
                    "") as string
                }
              />
              <ArrowUpRightIcon className="size-4 cursor-pointer text-primary hover:!text-primary dark:text-[#666]" />
            </div>
          </div>
        );
        break;
      }
      case "transaction": {
        onSelect = () => nav.navigateToTransaction({ transactionId: item.id });

        icon = <ReceiptIcon className="size-4 text-primary dark:text-[#666]" />;
        resultDisplay = (
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-grow items-center gap-2 truncate">
              <span>{(item.data?.name || "") as string}</span>
              <span className="text-xs text-muted-foreground">
                <FormatAmount
                  currency={item.data!.currency!}
                  amount={item.data!.amount!}
                />
              </span>
              <span className="text-xs text-muted-foreground">
                {item.data?.date
                  ? formatDate(item.data.date, dateFormat)
                  : null}
              </span>
            </div>
            <div className="invisible flex items-center gap-2 group-hover/item:visible group-focus/item:visible group-aria-selected/item:visible">
              <CopyButton path={`?transactionId=${item.id}`} />
              <ArrowUpRightIcon className="size-4 cursor-pointer text-primary hover:!text-primary dark:text-[#666]" />
            </div>
          </div>
        );
        break;
      }
      default:
        // For types not explicitly handled but have data,
        // icon remains the default data icon, and resultDisplay remains item.title.
        // This is fine.
        break;
    }
  }

  const handleSelect = () => {
    item.action?.();
    onSelect?.();
  };

  return (
    <CommandItem
      key={item.id}
      value={item.id}
      onSelect={handleSelect}
      className="group/item flex flex-col items-start gap-1 py-2 text-sm"
    >
      <div className="flex w-full items-center gap-2">
        {icon}
        {resultDisplay}
      </div>
    </CommandItem>
  );
};

export function Search() {
  const { data: user } = useUserQuery();
  const [debounceDelay, setDebounceDelay] = useState(200);
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const height = useRef<HTMLDivElement>(null);
  const nav = useSearchNavigation();
  const trpc = useTRPC();

  useHotkeys(
    "esc",
    () => {
      setDebouncedSearch("");
    },
    {
      enableOnFormTags: true,
    },
  );

  const [debouncedSearch, setDebouncedSearch] = useDebounceValue(
    "",
    debounceDelay,
  );

  const sectionActions: SearchItem[] = [
    {
      id: "sc-create-transaction",
      type: "transaction",
      title: "Create transaction",
      action: nav.createTransaction,
    },
    {
      id: "sc-view-documents",
      type: "vault",
      title: "View vault",
      action: () => nav.navigateToPath("/vault"),
    },
    {
      id: "sc-view-transactions",
      type: "transaction",
      title: "View transactions",
      action: () => nav.navigateToPath("/transactions"),
    },
  ];

  // Fetch data using useQuery
  const {
    data: queryResult,
    isLoading,
    isFetching,
  } = useQuery({
    ...trpc.search.global.queryOptions({
      searchTerm: debouncedSearch,
    }),
    placeholderData: (previousData) => previousData,
  });

  // Extract search results array from queryResult
  const searchResults: SearchItem[] = queryResult ?? [];

  const combinedData = useMemo(() => {
    // Type assertion for searchResults from DB to ensure they have actions if needed,
    // or map them to include default actions. For now, assuming they come with 'type' and 'title'.
    const mappedSearchResults = searchResults.map((res) => ({
      ...res,
      action: () => {},
    }));
    return [...mappedSearchResults];
  }, [debouncedSearch, searchResults]);

  const groupedData = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    // Group search results first
    for (const item of combinedData) {
      const groupKey = item.type || "other";
      groups[groupKey] ??= [];

      groups[groupKey].push(item);
    }

    // Filter sectionActions based on debouncedSearch
    const filteredSectionActions = debouncedSearch
      ? sectionActions.filter((action) =>
          action.title.toLowerCase().includes(debouncedSearch.toLowerCase()),
        )
      : sectionActions;

    // Add filtered sectionActions to their respective groups
    for (const actionItem of filteredSectionActions) {
      const groupKey = actionItem.type;
      groups[groupKey] ??= [];

      groups[groupKey].push(actionItem);
    }

    // Prioritize tracker projects when timer is running
    const definedGroupOrder = ["vault", "transaction"];

    const allGroupKeysInOrder: string[] = [];
    const addedKeys = new Set<string>();

    // Add groups based on defined order if they exist
    for (const key of definedGroupOrder) {
      if (groups[key]) {
        allGroupKeysInOrder.push(key);
        addedKeys.add(key);
      }
    }
    // Add any remaining groups that weren't in the defined order
    for (const key in groups) {
      if (groups[key] && groups[key].length > 0 && !addedKeys.has(key)) {
        allGroupKeysInOrder.push(key);
        addedKeys.add(key);
      }
    }

    const orderedGroups: Record<string, SearchItem[]> = {};
    for (const key of allGroupKeysInOrder) {
      if (groups[key] && groups[key].length > 0) {
        // Ensure group is not empty before adding
        orderedGroups[key] = groups[key];
      }
    }
    return orderedGroups;
  }, [combinedData, debouncedSearch]);

  useEffect(() => {
    if (height.current && ref.current) {
      const el = height.current;
      const wrapper = ref.current;
      let animationFrame: number;
      const observer = new ResizeObserver(() => {
        animationFrame = requestAnimationFrame(() => {
          const newHeight = el.offsetHeight;
          wrapper.style.setProperty("--search-list-height", `${newHeight}px`);
        });
      });
      observer.observe(el);
      return () => {
        cancelAnimationFrame(animationFrame);
        observer.unobserve(el);
      };
    }
  }, []);

  return (
    <Command
      shouldFilter={false}
      className="search-container relative h-auto w-full overflow-hidden border border-border bg-background p-0 backdrop-blur-lg backdrop-filter dark:border-[#2C2C2C] dark:bg-[#151515]/[99]"
    >
      <div className="relative border-b border-border">
        <CommandInput
          ref={searchInputRef}
          placeholder="Type a command or search..."
          onValueChange={(value: string) => {
            setDebouncedSearch(value);

            // If the search term is longer than 1 word, increase the debounce delay
            if (value.trim().split(/\s+/).length > 1) {
              setDebounceDelay(700);
            } else {
              setDebounceDelay(200);
            }
          }}
          className="h-[55px] px-4 py-0"
        />
        {isFetching && (
          <div className="absolute bottom-0 h-[2px] w-full overflow-hidden">
            <div className="animate-slide-effect absolute top-[1px] h-full w-40 bg-gradient-to-r from-gray-200 via-black via-80% to-gray-200 dark:from-gray-800 dark:via-white dark:via-80% dark:to-gray-800" />
          </div>
        )}
      </div>

      <div className="global-search-list px-2" ref={ref}>
        <CommandList ref={height} className="scrollbar-hide">
          {!isLoading && combinedData.length === 0 && debouncedSearch && (
            <CommandEmpty>
              No results found for &quot;{debouncedSearch}&quot;.
            </CommandEmpty>
          )}
          {!isLoading &&
            Object.entries(groupedData).map(([groupName, items]) => (
              <CommandGroup
                key={groupName}
                heading={formatGroupName(groupName)}
              >
                {items.map((item: SearchItem) => (
                  <SearchResultItemDisplay
                    key={item.id}
                    item={item}
                    dateFormat={user?.dateFormat ?? undefined}
                  />
                ))}
              </CommandGroup>
            ))}
        </CommandList>
      </div>
    </Command>
  );
}
