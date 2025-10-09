import { Columns2Icon } from "lucide-react";
import { useTransactionsStore } from "~/lib/stores/transaction";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export function TransactionsColumnVisibility() {
  const { columns } = useTransactionsStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Columns2Icon size={18} />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0" align="end" sideOffset={8}>
        <div className="flex max-h-[352px] flex-col space-y-2 overflow-auto p-4">
          {columns
            .filter(
              (column) =>
                column.columnDef.enableHiding !== false &&
                column.id !== "status",
            )
            .map((column) => {
              return (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) =>
                      column.toggleVisibility(checked === true)
                    }
                  />
                  <label
                    htmlFor={column.id}
                    className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {column.columnDef.header?.toString() ?? column.id}
                  </label>
                </div>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
