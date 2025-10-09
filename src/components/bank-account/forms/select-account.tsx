import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDownIcon, Wallet2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { Spinner } from "~/components/load-more";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { AccountType } from "~/shared/constants/enum";
import { useTRPC } from "~/shared/helpers/trpc/client";

export type BankAccount = RouterOutput["bankAccount"]["get"][number];

type BankAccountOption = {
  id: string;
  label: string;
  logo: string | null;
  type?: string | null;
};

type Selected = {
  id: string;
  name: string;
  logoUrl?: string | null;
  type?: AccountType | null;
};

type Props = {
  selected?: string;
  onChange?: (value: Selected) => void;
  headless?: boolean;
  hideLoading?: boolean;
  align?: "end" | "start";
  className?: string;
};

function transformBankAccount(bankAccount: BankAccount): BankAccountOption {
  return {
    id: bankAccount.id,
    label: bankAccount.name,
    logo: bankAccount.institution?.logo ?? "",
  };
}

export function SelectAccount({
  onChange,
  selected,
  hideLoading,
  headless,
  align,
}: Props) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(trpc.bankAccount.get.queryOptions({}));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const accounts = data?.map(transformBankAccount) ?? [];
  const filteredItems = accounts.filter((item) =>
    item.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const showCreate = Boolean(inputValue) && !filteredItems.length;

  const createBankAccountMutation = useMutation(
    trpc.bankAccount.createManualBankAccount.mutationOptions({
      onSuccess: (data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.get.queryKey(),
        });

        if (data) {
          onChange?.({
            id: data.id,
            name: data.name ?? "",
            logoUrl: null,
          });
        }
      },
    }),
  );

  const selectedAccount = useMemo(() => {
    const account = accounts?.find((a) => a.id === selected);
    if (!account) return undefined;

    return {
      id: account.id,
      name: account.label,
      logoUrl: account.logo,
    } satisfies Selected;
  }, [accounts, selected]);

  if (!selected && isLoading && !hideLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const Component = (
    <Command loop shouldFilter={false}>
      <CommandInput
        value={inputValue}
        onValueChange={setInputValue}
        placeholder={"Search category..."}
        className="px-1"
      />

      <CommandGroup>
        <CommandList className="max-h-[225px] overflow-auto">
          {filteredItems.map((item) => {
            return (
              <CommandItem
                disabled={createBankAccountMutation.isPending}
                className="cursor-pointer"
                key={item.id}
                value={item.id}
                onSelect={(id) => {
                  const foundItem = accounts.find((item) => item.id === id);

                  if (!foundItem) {
                    return;
                  }

                  onChange?.({
                    id: foundItem.id,
                    name: foundItem.label,
                    logoUrl: foundItem.logo,
                  });
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-1.5">
                  <Avatar className="size-4 rounded-none bg-transparent">
                    <AvatarImage
                      src={item.logo ?? undefined}
                      alt={`${item.label} logo`}
                    ></AvatarImage>
                    <AvatarFallback className="rounded-none bg-transparent">
                      <Wallet2Icon className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{item.label}</span>
                </div>
              </CommandItem>
            );
          })}

          <CommandEmpty>{"No account found"}</CommandEmpty>

          {showCreate && (
            <CommandItem
              key={inputValue}
              value={inputValue}
              onSelect={() => {
                createBankAccountMutation.mutate({
                  name: inputValue,
                  balance: 0,
                  currency: "EUR", // TODO: use default currency
                });
                setOpen(false);
                setInputValue("");
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            >
              <div className="flex items-center space-x-2">
                <span>{`Create "${inputValue}"`}</span>
              </div>
            </CommandItem>
          )}
        </CommandList>
      </CommandGroup>
    </Command>
  );

  if (headless) {
    return Component;
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger
        asChild
        disabled={createBankAccountMutation.isPending}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Button
          variant="outline"
          className="h-9 w-full justify-start bg-background pl-3 text-left font-normal"
        >
          {selectedAccount ? (
            <Avatar className="size-4 rounded-none bg-transparent">
              <AvatarImage
                src={selectedAccount?.logoUrl ?? undefined}
                alt={`${selectedAccount?.name} logo`}
              ></AvatarImage>
              <AvatarFallback className="rounded-none bg-transparent">
                <Wallet2Icon className="size-4" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <span className="text-muted-foreground">
              Seleziona o crea un conto
            </span>
          )}

          {selectedAccount?.name}

          <ChevronsUpDownIcon className="ml-auto size-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align={align}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {Component}
      </PopoverContent>
    </Popover>
  );
}
