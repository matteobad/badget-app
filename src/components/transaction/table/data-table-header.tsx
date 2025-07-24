"use client";

import { useCallback } from "react";
import { HorizontalPagination } from "~/components/horizontal-pagination";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useSortParams } from "~/hooks/use-sort-params";
import { useStickyColumns } from "~/hooks/use-sticky-columns";
import { cn } from "~/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface TableColumn {
  id: string;
  getIsVisible: () => boolean;
}

interface TableInterface {
  getAllLeafColumns: () => TableColumn[];
  getIsAllPageRowsSelected: () => boolean;
  getIsSomePageRowsSelected: () => boolean;
  toggleAllPageRowsSelected: (value: boolean) => void;
}

interface TableScrollState {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  isScrollable: boolean;
  scrollLeft: () => void;
  scrollRight: () => void;
}

interface Props {
  table?: TableInterface;
  loading?: boolean;
  tableScroll?: TableScrollState;
}

export function DataTableHeader({ table, loading, tableScroll }: Props) {
  const { params, setParams } = useSortParams();
  const [column, value] = params.sort ?? [];

  const createSortQuery = useCallback(
    (name: string) => {
      if (value === "asc") {
        // If currently ascending, switch to descending
        void setParams({ sort: [name, "desc"] });
      } else if (value === "desc") {
        // If currently descending, clear sort
        void setParams({ sort: null });
      } else {
        // If not sorted on this column, set to ascending
        void setParams({ sort: [name, "asc"] });
      }
    },
    [value, setParams],
  );

  // Use the reusable sticky columns hook
  const { getStickyStyle, isVisible } = useStickyColumns({
    table,
    loading,
  });

  console.log(tableScroll?.isScrollable);

  return (
    <TableHeader className="border-r-0 border-l-0">
      <TableRow className="h-[45px] hover:bg-transparent">
        <TableHead
          className={cn(
            "z-10 w-[50px] min-w-[50px] border-r border-border bg-background px-3 py-2 md:sticky md:left-[var(--stick-left)] md:px-4",
            "before:absolute before:top-0 before:right-0 before:bottom-0 before:w-px before:bg-border",
            "after:absolute after:top-0 after:right-[-24px] after:bottom-0 after:z-[-1] after:w-6 after:bg-gradient-to-l after:from-transparent after:to-background",
          )}
          style={getStickyStyle("select")}
        >
          <Checkbox
            checked={
              table?.getIsAllPageRowsSelected() ??
              (table?.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table?.toggleAllPageRowsSelected(!!value)
            }
          />
        </TableHead>

        {isVisible("date") && (
          <TableHead
            className={cn(
              "z-10 w-[110px] min-w-[110px] border-r border-border bg-background px-3 py-2 md:sticky md:left-[var(--stick-left)] md:px-4",
              "before:absolute before:top-0 before:right-0 before:bottom-0 before:w-px before:bg-border",
              "after:absolute after:top-0 after:right-[-24px] after:bottom-0 after:z-[-1] after:w-6 after:bg-gradient-to-l after:from-transparent after:to-background",
            )}
            style={getStickyStyle("date")}
          >
            <Button
              className="space-x-2 p-0 hover:bg-transparent"
              variant="ghost"
              onClick={() => createSortQuery("date")}
            >
              <span>Date</span>
              {"date" === column && value === "asc" && <ArrowDown size={16} />}
              {"date" === column && value === "desc" && <ArrowUp size={16} />}
            </Button>
          </TableHead>
        )}

        {isVisible("description") && (
          <TableHead
            className={cn(
              "z-10 min-w-[320px] border-r border-border bg-background px-3 py-2 md:sticky md:left-[var(--stick-left)] md:px-4",
              "before:absolute before:top-0 before:right-0 before:bottom-0 before:w-px before:bg-border",
              "after:absolute after:top-0 after:right-[-24px] after:bottom-0 after:z-[-1] after:w-6 after:bg-gradient-to-l after:from-transparent after:to-background",
            )}
            style={getStickyStyle("description")}
          >
            <div className="flex items-center justify-between">
              <Button
                className="space-x-2 p-0 hover:bg-transparent"
                variant="ghost"
                onClick={() => createSortQuery("name")}
              >
                <span>Description</span>
                {"name" === column && value === "asc" && (
                  <ArrowDown size={16} />
                )}
                {"name" === column && value === "desc" && <ArrowUp size={16} />}
              </Button>
              {tableScroll?.isScrollable && (
                <HorizontalPagination
                  canScrollLeft={tableScroll.canScrollLeft}
                  canScrollRight={tableScroll.canScrollRight}
                  onScrollLeft={tableScroll.scrollLeft}
                  onScrollRight={tableScroll.scrollRight}
                  className="hidden md:flex"
                />
              )}
            </div>
          </TableHead>
        )}

        {isVisible("category") && (
          <TableHead className="w-[250px] min-w-[250px] border-l border-border px-3 py-2 md:px-4">
            <Button
              className="space-x-2 p-0 hover:bg-transparent"
              variant="ghost"
              onClick={() => createSortQuery("category")}
            >
              <span>Category</span>
              {"category" === column && value === "asc" && (
                <ArrowDown size={16} />
              )}
              {"category" === column && value === "desc" && (
                <ArrowUp size={16} />
              )}
            </Button>
          </TableHead>
        )}

        {isVisible("tags") && (
          <TableHead className="w-[280px] max-w-[280px] px-3 py-2 md:px-4">
            <Button
              className="space-x-2 p-0 hover:bg-transparent"
              variant="ghost"
              onClick={() => createSortQuery("tags")}
            >
              <span>Tags</span>
              {"tags" === column && value === "asc" && <ArrowDown size={16} />}
              {"tags" === column && value === "desc" && <ArrowUp size={16} />}
            </Button>
          </TableHead>
        )}

        {isVisible("bank_account") && (
          <TableHead className="w-[250px] px-3 py-2 md:px-4">
            <Button
              className="space-x-2 p-0 hover:bg-transparent"
              variant="ghost"
              onClick={() => createSortQuery("bank_account")}
            >
              <span>Account</span>
              {"bank_account" === column && value === "asc" && (
                <ArrowDown size={16} />
              )}
              {"bank_account" === column && value === "desc" && (
                <ArrowUp size={16} />
              )}
            </Button>
          </TableHead>
        )}

        {isVisible("method") && (
          <TableHead className="w-[140px] min-w-[140px] px-3 py-2 md:px-4">
            <Button
              className="space-x-2 p-0 hover:bg-transparent"
              variant="ghost"
              onClick={() => createSortQuery("method")}
            >
              <span>Method</span>
              {"method" === column && value === "asc" && (
                <ArrowDown size={16} />
              )}
              {"method" === column && value === "desc" && <ArrowUp size={16} />}
            </Button>
          </TableHead>
        )}

        {isVisible("amount") && (
          <TableHead className="w-[170px] min-w-[170px] px-3 py-2 text-right md:px-4">
            <Button
              className="space-x-2 p-0 hover:bg-transparent"
              variant="ghost"
              onClick={() => createSortQuery("amount")}
            >
              <span>Amount</span>
              {"amount" === column && value === "asc" && (
                <ArrowDown size={16} />
              )}
              {"amount" === column && value === "desc" && <ArrowUp size={16} />}
            </Button>
          </TableHead>
        )}

        {isVisible("actions") && (
          <TableHead
            className={cn(
              "z-10 w-[64px] grow-0 bg-background md:sticky md:right-0",
              "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-px before:bg-border",
              "after:absolute after:top-0 after:bottom-0 after:left-[-24px] after:z-[-1] after:w-6 after:bg-gradient-to-r after:from-transparent after:to-background",
            )}
          ></TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
}
