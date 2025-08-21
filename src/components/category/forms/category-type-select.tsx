import React from "react";
import { cn } from "~/lib/utils";
import { CATEGORY_TYPE } from "~/shared/constants/enum";
import { useScopedI18n } from "~/shared/locales/client";
import {
  ArrowLeftRightIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

type CategoryTypeSelectProps = {
  className?: string;
  placeholder?: string;
};

export function CategoryTypeSelect({
  className,
  placeholder,
  ...props
}: React.ComponentPropsWithoutRef<typeof Select> & CategoryTypeSelectProps) {
  const tScoped = useScopedI18n("category.type");

  return (
    <Select {...props}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
        {Object.values(CATEGORY_TYPE).map((type) => {
          return (
            <SelectItem value={type} key={type}>
              {type === "income" && (
                <TrendingUpIcon className="size-4 text-muted-foreground" />
              )}
              {type === "expense" && (
                <TrendingDownIcon className="size-4 text-muted-foreground" />
              )}
              {type === "transfer" && (
                <ArrowLeftRightIcon className="size-4 text-muted-foreground" />
              )}
              <span className="truncate">{tScoped(type)}</span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
