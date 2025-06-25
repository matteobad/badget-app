import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { dynamicIconImports } from "lucide-react/dynamic";
import React from "react";
import { DynamicIcon } from "lucide-react/dynamic";

import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";

type CategoryPickerProps = {
  options: RouterOutput["category"]["getAll"];
  isLoading: boolean;
  onReset?: () => void;
};

export function CategoryPicker({
  options,
  isLoading,
  onReset,
  ...props
}: React.ComponentPropsWithoutRef<typeof Select> & CategoryPickerProps) {
  return (
    <Select {...props} value={props.value ?? ""}>
      <SelectTrigger className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 [&>span_svg]:text-muted-foreground/80">
        <SelectValue placeholder="Categorizza"></SelectValue>
      </SelectTrigger>
      <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
        <SelectGroup>
          {isLoading ? (
            <Skeleton />
          ) : (
            options.map((option) => {
              return (
                <SelectItem value={option.id} key={option.id}>
                  <DynamicIcon
                    className="size-4"
                    name={option.icon as keyof typeof dynamicIconImports}
                  />
                  {option.name}
                </SelectItem>
              );
            })
          )}
        </SelectGroup>
        {onReset && (
          <SelectGroup>
            <SelectSeparator />
            <Button
              className="w-full px-2"
              variant="secondary"
              size="sm"
              onClick={onReset}
            >
              Pulisci selezione
            </Button>
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
