import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useScopedI18n } from "~/shared/locales/client";
import {
  endOfMonth,
  formatISO,
  startOfMonth,
  subMonths,
  subYears,
} from "date-fns";

import { useWidget } from "../widget";

const PERIOD = {
  "3M": "3M",
  "6M": "6M",
  "1Y": "1Y",
} as const;
type PeriodType = (typeof PERIOD)[keyof typeof PERIOD];

const options: Record<PeriodType, { from: string; to: string }> = {
  "3M": {
    from: formatISO(subMonths(startOfMonth(new Date()), 2), {
      representation: "date",
    }),
    to: formatISO(endOfMonth(new Date()), { representation: "date" }),
  },
  "6M": {
    from: formatISO(subMonths(startOfMonth(new Date()), 5), {
      representation: "date",
    }),
    to: formatISO(endOfMonth(new Date()), { representation: "date" }),
  },
  "1Y": {
    from: formatISO(subMonths(startOfMonth(new Date()), 11), {
      representation: "date",
    }),
    to: formatISO(endOfMonth(new Date()), { representation: "date" }),
  },
};

export function SavingsWidgetSettings() {
  const tAverageSavingsSettings = useScopedI18n("widgets.savings.settings");

  const { draftSettings, setDraftSettings } = useWidget();

  return (
    <div className="flex w-full flex-col gap-2">
      <Select
        onValueChange={(value) => {
          const newPeriod = value as PeriodType;
          const option = options[newPeriod] ?? options["3M"];
          setDraftSettings({ ...draftSettings, period: newPeriod, ...option });
        }}
        defaultValue={draftSettings?.period ?? PERIOD["3M"]}
      >
        <SelectTrigger className="w-full" size="sm">
          <SelectValue placeholder="Periodo" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(PERIOD).map((period) => {
            return (
              <SelectItem value={period}>
                {tAverageSavingsSettings(period)}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
