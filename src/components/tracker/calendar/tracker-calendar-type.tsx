"use client";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useTrackerParams } from "~/hooks/use-tracker-params";
import { setWeeklyCalendarAction } from "~/server/domain/recurring-entry/actions";
import { useAction } from "next-safe-action/hooks";

const options = [
  {
    value: "week",
    label: "Week",
  },
  {
    value: "month",
    label: "Month",
  },
] as const;

type Props = {
  selectedView: "week" | "month";
};

export function TrackerCalendarType({ selectedView }: Props) {
  const { setParams } = useTrackerParams();
  const setWeeklyCalendar = useAction(setWeeklyCalendarAction);

  const handleChange = (value: string) => {
    void setParams({ view: value as "week" | "month" });
    setWeeklyCalendar.execute(value === "week");
  };

  return (
    <Tabs
      className="h-[37px]"
      value={selectedView}
      onValueChange={handleChange}
    >
      <TabsList className="h-[37px] p-0">
        {options.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className="h-[36px] !bg-transparent !shadow-none"
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
