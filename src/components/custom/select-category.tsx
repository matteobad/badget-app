import type { dynamicIconImports } from "lucide-react/dynamic";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { DynamicIcon } from "lucide-react/dynamic";

import { Spinner } from "../load-more";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

type Props = {
  selected?: string[] | null;
  onChange: (selected: string) => void;
  hideLoading?: boolean;
};

export function SelectCategory({ selected, onChange, hideLoading }: Props) {
  const trpc = useTRPC();
  const { data: categories, isLoading } = useQuery(
    trpc.category.get.queryOptions({}),
  );

  if (!selected && isLoading && !hideLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="h-full w-full *:not-first:mt-2">
      <Command>
        <CommandInput placeholder="Search category..." />
        <CommandList>
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup className="[&>div]:flex [&>div]:flex-col [&>div]:gap-0.5">
            {categories?.map((item) => (
              <CommandItem
                key={item.slug}
                value={item.slug}
                onSelect={(value) => {
                  const slug = categories.find((c) => c.slug === value)?.slug;
                  if (slug) {
                    onChange(slug);
                  }
                }}
                className={cn("flex items-center justify-between", {
                  "bg-accent text-accent-foreground": selected?.includes(
                    item.slug,
                  ),
                })}
              >
                <div className="flex items-center gap-2">
                  <DynamicIcon
                    name={item.icon as keyof typeof dynamicIconImports}
                    className="size-4 text-muted-foreground"
                  />
                  {item.name}
                </div>
                {/* <span className="text-xs text-muted-foreground">
                      {item.number.toLocaleString()}
                    </span> */}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
