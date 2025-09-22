import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";

export function CategoriesSkeleton({ isEmpty }: { isEmpty?: boolean }) {
  return (
    <div className="w-full">
      <div
        className={cn(
          "overflow-x-auto",
          !isEmpty && "border-border md:border-r md:border-l",
        )}
      >
        <Table
          className={cn(
            "min-w-[1600px]",
            isEmpty && "pointer-events-none opacity-20 blur-[7px]",
          )}
        >
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment */}
            {[...Array(15)].map((_, index) => (
              <TableRow
                key={index.toString()}
                className="h-[49px] hover:bg-transparent"
              >
                {/* Name column - always visible */}
                <TableCell className="w-full min-w-[320px]">
                  <Skeleton className="h-3.5 w-[50%]" />
                </TableCell>
                {/* Actions column - always visible */}
                <TableCell className="w-[100px]">
                  <Skeleton className="h-[20px] w-[20px]" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
