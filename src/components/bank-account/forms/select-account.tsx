import type { ComboboxItem } from "~/components/ui/combobox-dropdown";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TransactionBankAccount } from "~/components/transaction/transaction-bank-account";
import { ComboboxDropdown } from "~/components/ui/combobox-dropdown";
import { formatAccountName } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";

type SelectedItem = ComboboxItem & {
  id: string;
  label: string;
  logo: string | null;
  currency: string;
  type?: string | null;
};

type Props = {
  placeholder: string;
  className?: string;
  value?: string;
  onChange: (value: SelectedItem) => void;
};

export function SelectAccount({ placeholder, onChange, value }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  const { data, isLoading } = useQuery(trpc.bankAccount.get.queryOptions({}));

  const createBankAccountMutation = useMutation(
    trpc.bankAccount.createManualBankAccount.mutationOptions({
      onSuccess: (data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.get.queryKey(),
        });

        if (data) {
          onChange({
            id: data.id,
            label: data.name ?? "",
            logo: null,
            currency: data.currency,
          });

          setSelectedItem({
            id: data.id,
            label: data.name ?? "",
            logo: null,
            currency: data.currency,
          });
        }
      },
    }),
  );

  useEffect(() => {
    if (value && data) {
      const found = data.find((d) => d.id === value);

      if (found) {
        setSelectedItem({
          id: found.id,
          label: found.name ?? "",
          logo: found?.logoUrl ?? null,
          currency: found.currency,
        });
      }
    }
  }, [value, data]);

  if (isLoading) {
    return null;
  }

  return (
    <ComboboxDropdown
      disabled={createBankAccountMutation.isPending}
      placeholder={placeholder}
      searchPlaceholder="Select or create account"
      items={
        data?.map((d) => ({
          id: d.id,
          label: d.name ?? "",
          logo: d.logoUrl ?? null,
          currency: d.currency,
        })) ?? []
      }
      selectedItem={selectedItem ?? undefined}
      onSelect={(item) => {
        onChange(item);
      }}
      onCreate={(name) => {
        createBankAccountMutation.mutate({ name, balance: 0, currency: "EUR" });
      }}
      renderSelectedItem={(selectedItem) => {
        return (
          <TransactionBankAccount
            name={formatAccountName({
              name: selectedItem.label,
              currency: selectedItem?.currency,
            })}
            logoUrl={selectedItem?.logo ?? undefined}
          />
        );
      }}
      renderOnCreate={(value) => {
        return (
          <div className="flex items-center space-x-2">
            <span>{`Create "${value}"`}</span>
          </div>
        );
      }}
      renderListItem={({ item }) => {
        return (
          <TransactionBankAccount
            name={formatAccountName({
              name: item.label,
              currency: item?.currency,
            })}
            logoUrl={item.logo ?? undefined}
          />
        );
      }}
    />
  );
}
