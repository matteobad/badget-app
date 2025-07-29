"use client";

import { Input } from "~/components/ui/input";

export function TagsSearchFilter() {
  return (
    <div className="flex items-center justify-between">
      <Input
        placeholder="Search..."
        // value={(table?.getColumn("name")?.getFilterValue() as string) ?? ""}
        // onChange={(event) =>
        //   table?.getColumn("name")?.setFilterValue(event.target.value)
        // }
        className="max-w-sm"
      />
    </div>
  );
}
