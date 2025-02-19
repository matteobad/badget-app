import type { dynamicIconImports } from "lucide-react/dynamic";
import React from "react";
import { DynamicIcon } from "lucide-react/dynamic";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type CategoryPickerProps = {
  options: {
    id: string;
    icon: string | null;
    name: string;
  }[];
};

export function CategoryPicker({
  options,
  defaultValue,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  onValueChange,
}: React.ComponentPropsWithoutRef<typeof Select> & CategoryPickerProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 [&>span_svg]:text-muted-foreground/80">
        <SelectValue placeholder="Uncategorized" />
      </SelectTrigger>
      <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
        {options.map((option) => {
          return (
            <SelectItem value={option.id} key={option.id}>
              <DynamicIcon
                className="size-4"
                name={option.icon as keyof typeof dynamicIconImports}
              />
              {option.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
