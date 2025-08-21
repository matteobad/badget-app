import type { dynamicIconImports } from "lucide-react/dynamic";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "~/components/load-more";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { DynamicIcon } from "lucide-react/dynamic";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

type CategoryPickerProps = {
  onReset?: () => void;
  placeholder?: string;
};

export function CategorySelect({
  placeholder,
  ...props
}: React.ComponentPropsWithoutRef<typeof Select> & CategoryPickerProps) {
  const trpc = useTRPC();

  const { data: categories, isLoading } = useQuery(
    trpc.category.get.queryOptions({}),
  );

  return (
    <Select {...props}>
      <SelectTrigger className="w-full bg-background">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
        {isLoading ? (
          <div className="flex size-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          categories?.map((category) => {
            return (
              <SelectItem value={category.id} key={category.id}>
                <DynamicIcon
                  name={category.icon as keyof typeof dynamicIconImports}
                  size={16}
                  aria-hidden="true"
                />
                <span className="truncate">{category.name}</span>
              </SelectItem>
            );
          })
        )}
      </SelectContent>
    </Select>
  );
}
