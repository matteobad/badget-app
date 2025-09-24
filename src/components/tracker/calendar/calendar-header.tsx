import { AnimatedNumber } from "~/components/animated-number";
import { useSpaceQuery } from "~/hooks/use-space";

import { TrackerCalendarType } from "./tracker-calendar-type";
import { TrackerPeriodSelect } from "./tracker-period-select";
import { TrackerSettings } from "./tracker-settings";

type CalendarHeaderProps = {
  totalAmount?: number;
  selectedView: "week" | "month";
};

export function CalendarHeader({
  totalAmount,
  selectedView,
}: CalendarHeaderProps) {
  const { data: space } = useSpaceQuery();

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="space-y-1 select-text">
        <h1 className="flex items-baseline gap-1 space-x-2 font-mono text-4xl">
          <div>
            <AnimatedNumber
              value={totalAmount ?? 0}
              currency={space?.baseCurrency ?? "EUR"}
            />
          </div>
        </h1>
      </div>
      <div className="flex space-x-2">
        <TrackerPeriodSelect dateFormat="MMMM" />
        <TrackerSettings />
        <TrackerCalendarType selectedView={selectedView} />
      </div>
    </div>
  );
}
