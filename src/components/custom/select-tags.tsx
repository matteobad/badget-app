import { useQuery } from "@tanstack/react-query";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { LoaderCircleIcon } from "lucide-react";

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

export function SelectTags({ selected, onChange, hideLoading }: Props) {
  const trpc = useTRPC();

  const { data: tags, isLoading } = useQuery(trpc.tag.get.queryOptions({}));

  const { data: tagsCounts, isLoading: isLoadingTagsCounts } = useQuery(
    trpc.transaction.getTagsCounts.queryOptions(),
  );

  if (!selected && isLoading && !hideLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="size-full *:not-first:mt-2">
      <Command>
        <CommandInput placeholder="Search tag..." />
        <CommandList className="max-h-[245px]">
          <CommandEmpty>No tag found.</CommandEmpty>
          <CommandGroup className="[&>div]:flex [&>div]:flex-col [&>div]:gap-0.5">
            {tags?.map((item) => (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={(value) => {
                  const id = tags.find((t) => t.id === value)?.id;
                  if (id) {
                    onChange(id);
                  }
                }}
                className={cn("flex items-center justify-between", {
                  "bg-accent text-accent-foreground": selected?.includes(
                    item.id,
                  ),
                })}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="line-clamp-1 text-sm">{item.text}</span>
                </div>
                {isLoadingTagsCounts ? (
                  <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {tagsCounts![item.id]?.toLocaleString()}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
