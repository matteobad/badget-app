"use client";

import { Skeleton } from "~/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { TransactionsTableHeader } from "../../../../../components/tables/transactions-table-header";

const data = [...Array<unknown>(40)].map((_, i) => ({ id: i.toString() }));

export function TransactionsTableLoading({ isEmpty }: { isEmpty?: boolean }) {
  return (
    <Table
      className={cn(isEmpty && "pointer-events-none opacity-20 blur-[7px]")}
    >
      <TransactionsTableHeader loading />

      <TableBody>
        {data?.map((row) => (
          <TableRow key={row.id} className="h-[45px]">
            <TableCell className="w-[50px]">
              <Skeleton
                className={cn("h-3.5 w-[15px]", isEmpty && "animate-none")}
              />
            </TableCell>

            <TableCell className="w-[100px]">
              <Skeleton
                className={cn("h-3.5 w-[60%]", isEmpty && "animate-none")}
              />
            </TableCell>
            <TableCell className="w-[430px]">
              <Skeleton
                className={cn("h-3.5 w-[50%]", isEmpty && "animate-none")}
              />
            </TableCell>
            <TableCell className="w-[200px]">
              <Skeleton
                className={cn("h-3.5 w-[50%]", isEmpty && "animate-none")}
              />
            </TableCell>

            <TableCell className="w-[200px]">
              <Skeleton
                className={cn("h-3.5 w-[60%]", isEmpty && "animate-none")}
              />
            </TableCell>
            <TableCell className="w-[150px]">
              <Skeleton
                className={cn("h-3.5 w-[80px]", isEmpty && "animate-none")}
              />
            </TableCell>
            <TableCell className="w-[200px]">
              <div className="flex w-[80%] items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton
                  className={cn("h-3.5 w-[70%]", isEmpty && "animate-none")}
                />
              </div>
            </TableCell>
            <TableCell className="w-50px">
              <Skeleton
                className={cn(
                  "h-[20px] w-[20px] rounded-full",
                  isEmpty && "animate-none",
                )}
              />
            </TableCell>
            <TableCell className="w-60px" />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
