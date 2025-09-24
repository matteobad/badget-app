import { TZDate } from "@date-fns/tz";
import { Button } from "~/components/ui/button";
import { useTrackerParams } from "~/hooks/use-tracker-params";
import { useUserQuery } from "~/hooks/use-user";
import { cn } from "~/lib/utils";
import {
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  formatISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

type Props = {
  className?: string;
  dateFormat?: string;
};

export function TrackerPeriodSelect({ className, dateFormat = "MMM" }: Props) {
  const { date, view, setParams } = useTrackerParams();
  const { data: user } = useUserQuery();

  const weekStartsOnMonday = user?.weekStartsOnMonday ?? false;
  const currentDate = date
    ? new TZDate(date, "UTC")
    : new TZDate(new Date(), "UTC");

  const selectPrevPeriod = () => {
    if (view === "week") {
      void setParams({
        date: formatISO(
          startOfWeek(addWeeks(currentDate, -1), {
            weekStartsOn: weekStartsOnMonday ? 1 : 0,
          }),
          {
            representation: "date",
          },
        ),
      });
    } else {
      void setParams({
        date: formatISO(startOfMonth(addMonths(currentDate, -1)), {
          representation: "date",
        }),
      });
    }
  };

  const selectNextPeriod = () => {
    if (view === "week") {
      void setParams({
        date: formatISO(
          startOfWeek(addWeeks(currentDate, 1), {
            weekStartsOn: weekStartsOnMonday ? 1 : 0,
          }),
          {
            representation: "date",
          },
        ),
      });
    } else {
      void setParams({
        date: formatISO(startOfMonth(addMonths(currentDate, 1)), {
          representation: "date",
        }),
      });
    }
  };

  const getPeriodLabel = () => {
    if (view === "week") {
      const weekStart = startOfWeek(currentDate, {
        weekStartsOn: weekStartsOnMonday ? 1 : 0,
      });
      const weekEnd = endOfWeek(currentDate, {
        weekStartsOn: weekStartsOnMonday ? 1 : 0,
      });

      // If week spans across months, show both months
      if (weekStart.getMonth() !== weekEnd.getMonth()) {
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      }

      // If same month, show month once
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "d, yyyy")}`;
    }
    return format(currentDate, dateFormat);
  };

  return (
    <div className={cn("flex h-9 items-center border", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="mr-4 ml-2 h-6 w-6 p-0 hover:bg-transparent"
        onClick={selectPrevPeriod}
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </Button>
      <span className="w-full text-center text-sm">{getPeriodLabel()}</span>
      <Button
        variant="ghost"
        size="icon"
        className="mr-2 ml-4 h-6 w-6 p-0 hover:bg-transparent"
        onClick={selectNextPeriod}
      >
        <ChevronRightIcon className="h-6 w-6" />
      </Button>
    </div>
  );
}
