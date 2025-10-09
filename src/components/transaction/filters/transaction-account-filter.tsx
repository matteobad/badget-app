import { useQuery } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { BankLogo } from "~/components/bank-logo";
import { Spinner } from "~/components/load-more";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";

type Props = {
  selected?: string[] | null;
  onChange: (selected: string) => void;
  hideLoading?: boolean;
};

export function TransactionAccountFilter({
  selected,
  onChange,
  hideLoading,
}: Props) {
  const trpc = useTRPC();

  const { data: accounts, isLoading } = useQuery(
    trpc.bankAccount.get.queryOptions({}),
  );

  const { data: accountCounts, isLoading: isLoadingAccountCounts } = useQuery(
    trpc.transaction.getAccountCounts.queryOptions(),
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
        <CommandInput placeholder="Search category..." />
        <CommandList className="max-h-[245px]">
          <CommandEmpty>No account found.</CommandEmpty>
          <CommandGroup className="[&>div]:flex [&>div]:flex-col [&>div]:gap-0.5">
            {accounts?.map((item) => (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={(value) => {
                  const id = accounts.find((c) => c.id === value)?.id;
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
                <div className="line-clamp-1 flex items-center gap-2 overflow-hidden">
                  <BankLogo
                    src={item.institution?.logo ?? ""}
                    alt={`${item.name} logo`}
                    size={20}
                  />
                  <span className="line-clamp-1 text-sm">{item.name}</span>
                </div>
                {isLoadingAccountCounts ? (
                  <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {accountCounts![item.id]?.toLocaleString()}
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
