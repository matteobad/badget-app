import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function TagsSkeleton() {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>VAT</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
          {[...Array(15)].map((_, index) => (
            <TableRow
              key={index.toString()}
              className="h-[49px] hover:bg-transparent"
            >
              <TableCell className="w-[50px]">
                <Skeleton className="size-4 rounded-md" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-2 w-[20%]" />
              </TableCell>
              <TableCell className="w-[65px]">
                <Skeleton className="h-1 w-5" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
