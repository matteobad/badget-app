import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useScopedI18n } from "~/shared/locales/client";
import { formatISO, subMonths, subYears } from "date-fns";

import { useWidget } from "../widget";

const PERIOD = {
  "1M": "1M",
  "3M": "3M",
  "6M": "6M",
  "1Y": "1Y",
} as const;
type PeriodType = (typeof PERIOD)[keyof typeof PERIOD];

const options: Record<PeriodType, { from: string; to: string }> = {
  "1M": {
    from: formatISO(subMonths(new Date(), 1), { representation: "date" }),
    to: formatISO(new Date(), { representation: "date" }),
  },
  "3M": {
    from: formatISO(subMonths(new Date(), 3), { representation: "date" }),
    to: formatISO(new Date(), { representation: "date" }),
  },
  "6M": {
    from: formatISO(subMonths(new Date(), 6), { representation: "date" }),
    to: formatISO(new Date(), { representation: "date" }),
  },
  "1Y": {
    from: formatISO(subYears(new Date(), 1), { representation: "date" }),
    to: formatISO(new Date(), { representation: "date" }),
  },
};

export function NetWorthWidgetSettings() {
  const tNetWorthSettings = useScopedI18n("widgets.net-worth.settings");

  const { draftSettings, setDraftSettings } = useWidget();

  return (
    <div className="flex w-full flex-col gap-2">
      <Select
        onValueChange={(value) => {
          const newPeriod = value as PeriodType;
          const option = options[newPeriod] ?? options["1M"];
          setDraftSettings({ ...draftSettings, period: newPeriod, ...option });
        }}
        defaultValue={draftSettings?.period ?? PERIOD["1M"]}
      >
        <SelectTrigger className="w-full" size="sm">
          <SelectValue placeholder="Periodo" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(PERIOD).map((period) => {
            return (
              <SelectItem value={period}>
                {tNetWorthSettings(period)}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
