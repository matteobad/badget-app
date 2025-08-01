import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useI18n } from "~/shared/locales/client";
import { ChevronDownIcon } from "lucide-react";

import { options } from "./data";

type Props = {
  period: string;
  onChange: (period: string) => void;
};

export function SpendingPeriod({ period, onChange }: Props) {
  const t = useI18n();

  const selectedPeriod = options.find((option) => option.id === period);

  return (
    <div className="flex justify-between">
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
          <div className="flex items-center space-x-2">
            {/* @ts-expect-error boh */}
            <span>{t(`spending_period.${period}`)}</span>
            <ChevronDownIcon />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[180px]">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.id}
              onCheckedChange={() => onChange(option.id)}
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
