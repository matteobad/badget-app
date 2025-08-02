"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import type { Table } from "@tanstack/react-table";

type Props = {
  table?: Table<RouterOutput["organization"]["list"][number]>;
};

export function DataTableHeader({ table }: Props) {
  return (
    <div className="flex items-center space-x-4 pb-4">
      <Input
        className="flex-1"
        placeholder="Search..."
        value={(table?.getColumn("team")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table?.getColumn("team")?.setFilterValue(event.target.value)
        }
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
      />
      <Link href="/spaces/create">
        <Button>Create space</Button>
      </Link>
    </div>
  );
}
