"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { Table, TableBody } from "~/components/ui/table";

import { TableRow } from "./table-row";

type Props = {
  data: RouterOutput["organization"]["list"];
};

export function SelectOrgTable({ data }: Props) {
  return (
    <Table>
      <TableBody className="border-none">
        {data.map((row) => (
          <TableRow key={row.id} row={row} />
        ))}
      </TableBody>
    </Table>
  );
}
