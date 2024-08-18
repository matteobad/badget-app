"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { TableHead, TableHeader, TableRow } from "../ui/table";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table?: any;
  loading?: boolean;
};

export function TransactionsTableHeader({ table, loading }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const createSortQuery = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams);
      const prevSort = params.get("sort");

      if (`${name}:asc` === prevSort) {
        params.set("sort", `${name}:desc`);
      } else if (`${name}:desc` === prevSort) {
        params.delete("sort");
      } else {
        params.set("sort", `${name}:asc`);
      }

      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  const isVisible = (_: string) => loading ?? true;

  return (
    <TableHeader>
      <TableRow className="h-[45px] hover:bg-transparent">
        <TableHead className="hidden w-[50px] px-3 py-2 md:table-cell md:px-4">
          <Checkbox
            checked={
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              table?.getIsAllPageRowsSelected() ??
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              (table?.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        </TableHead>

        {isVisible("date") && (
          <TableHead className="w-[120px] px-3 py-2 md:px-4">
            <Button
              className="space-x-2 p-0 hover:bg-transparent"
              variant="ghost"
              onClick={() => createSortQuery("date")}
            >
              <span>Date</span>
            </Button>
          </TableHead>
        )}

        {isVisible("description") && (
          <TableHead className="w-[100px] px-3 py-2 md:w-[320px] md:px-4">
            <Button
              className="space-x-2 p-0 hover:bg-transparent"
              variant="ghost"
              onClick={() => createSortQuery("name")}
            >
              <span>Description</span>
            </Button>
          </TableHead>
        )}

        {isVisible("amount") && (
          <TableHead className="px-3 py-2 md:w-[200px] md:px-4">
            <Button
              className="space-x-2 p-0 hover:bg-transparent"
              variant="ghost"
              onClick={() => createSortQuery("amount")}
            >
              <span>Amount</span>
            </Button>
          </TableHead>
        )}

        {isVisible("category") && (
          <TableHead className="hidden px-3 py-2 md:table-cell md:w-[240px] md:px-4">
            <Button
              className="space-x-2 p-0 hover:bg-transparent"
              variant="ghost"
              onClick={() => createSortQuery("category")}
            >
              <span>Category</span>
            </Button>
          </TableHead>
        )}

        {isVisible("bank_account") && (
          <TableHead className="hidden px-3 py-2 md:table-cell md:w-[250px] md:px-4">
            <Button
              className="space-x-2 p-0 hover:bg-transparent"
              variant="ghost"
              onClick={() => createSortQuery("bank_account")}
            >
              <span>Account</span>
            </Button>
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
}
