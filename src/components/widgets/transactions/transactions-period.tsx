import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useI18n } from "~/shared/locales/client";
import { ChevronDownIcon } from "lucide-react";

import type { TransactionType } from "./data";
import { options } from "./data";

type Props = {
  type: TransactionType;
  setType: (type: TransactionType) => void;
  disabled: boolean;
};

export function TransactionsPeriod({ type, setType, disabled }: Props) {
  const t = useI18n();

  return (
    <div className="flex items-center justify-between">
      <div>
        <Link href="/transactions" prefetch>
          <h2 className="text-lg">Transactions</h2>
        </Link>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          className="flex h-9 items-center space-x-2 border p-2 px-3 text-sm"
        >
          <div className="flex items-center space-x-2">
            <span>{t(`transactions_period.${type}`)}</span>
            <ChevronDownIcon className="size-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[130px]">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              onCheckedChange={() => setType(option)}
              checked={option === type}
            >
              {t(`transactions_period.${option}`)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
