"use client";

import type { Table } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { CategoryWithChildren } from "./columns";

type Props = {
  table?: Table<CategoryWithChildren>;
  onOpenChange?: (isOpen: boolean) => void;
};

export function Header({ table, onOpenChange }: Props) {
  return (
    <div className="flex items-center justify-between pb-4">
      <Input
        placeholder="Search..."
        value={(table?.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table?.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />

      <Button onClick={() => onOpenChange?.(true)}>
        <PlusIcon className="size-4" /> Create
      </Button>
    </div>
  );
}
