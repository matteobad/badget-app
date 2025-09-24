"use client";

import { Skeleton } from "~/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";

import { DataTableHeader } from "./data-table-header";

const data = [...Array(10)].map((_, i) => ({ id: i.toString() }));

export function Loading() {
  return (
    <div className="w-full">
      <div className="overflow-x-auto border-border md:border-r md:border-l">
        <Table>
          <DataTableHeader />

          <TableBody className="border-t-0 border-r-0 border-b-0 border-l-0">
            {data?.map((row) => (
              <TableRow key={row.id} className="h-[45px]">
                <TableCell className="sticky left-0 z-20 w-[240px] min-w-[240px] bg-background">
                  <Skeleton className="h-3.5 w-[60%]" />
                </TableCell>
                <TableCell className="w-[180px]">
                  <Skeleton className="h-3.5 w-[50%]" />
                </TableCell>
                <TableCell className="w-[180px]">
                  <Skeleton className="h-3.5 w-[40%]" />
                </TableCell>
                <TableCell className="w-[190px]">
                  <Skeleton className="h-3.5 w-[50%]" />
                </TableCell>
                <TableCell className="w-[330px]">
                  <Skeleton className="h-3.5 w-[70%]" />
                </TableCell>
                <TableCell className="min-w-[170px]">
                  <Skeleton className="h-3.5 w-[60%]" />
                </TableCell>
                <TableCell className="w-[140px]">
                  <Skeleton className="h-3.5 w-[50%]" />
                </TableCell>
                <TableCell className="w-[150px] min-w-[150px]">
                  <Skeleton className="h-3.5 w-[40%]" />
                </TableCell>
                <TableCell className="sticky right-0 z-30 w-[100px] bg-background">
                  <Skeleton className="h-3.5 w-[30%]" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
