import { Skeleton } from "~/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { cn } from "~/lib/utils";

import { DataTableHeader } from "./table-header";

export function TeamsSkeleton() {
  return (
    <div className="w-full">
      <DataTableHeader />

      <Table>
        <TableBody>
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
          {[...Array(6)].map((_, index) => (
            <TableRow key={index.toString()} className="hover:bg-transparent">
              <TableCell className={cn("border-r-[0px] py-4")}>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-8 rounded-full" />

                  <div className="flex flex-col space-y-2">
                    <Skeleton className="h-3 w-[200px]" />
                    <Skeleton className="h-2 w-[150px]" />
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
