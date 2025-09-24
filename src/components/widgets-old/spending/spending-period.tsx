import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useI18n } from "~/shared/locales/client";
import { ChevronDownIcon } from "lucide-react";

import type { SpendingPeriodType } from "./data";
import { options } from "./data";

type Props = {
  period: SpendingPeriodType;
  onChange: (period: SpendingPeriodType) => void;
};

export function SpendingPeriod({ period, onChange }: Props) {
  const t = useI18n();

  const selectedPeriod = options.find((option) => option.id === period);

  return (
    <div className="flex items-center justify-between">
      <div>
        <Link
          href={`/transactions?start=${selectedPeriod?.from}&end=${selectedPeriod?.to}&amount=lte,0`}
          prefetch
        >
          <h2 className="text-lg">Spending</h2>
        </Link>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex h-9 items-center space-x-2 border p-2 px-3 text-sm">
            <span>{t(`spending_period.${period}`)}</span>
            <ChevronDownIcon className="size-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto" align="end">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.id}
              onCheckedChange={() => onChange(option.id as SpendingPeriodType)}
              checked={option.id === period}
            >
              {/* @ts-expect-error boh */}
              {t(`spending_period.${option.id}`)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
