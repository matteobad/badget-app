import NumberFlow from "@number-flow/react";

type CalendarHeaderProps = {
  totalDuration?: number;
  selectedView: "week" | "month";
};

export function CalendarHeader({
  totalDuration,
  selectedView,
}: CalendarHeaderProps) {
  const hours = Math.floor((totalDuration || 0) / 3600);
  const minutes = Math.floor(((totalDuration || 0) % 3600) / 60);

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="space-y-1 select-text">
        <h1 className="flex items-baseline gap-1 space-x-2 font-mono text-4xl">
          <div>
            <NumberFlow value={hours || 0} />
            <span className="relative">h</span>
          </div>
          <div>
            <NumberFlow value={minutes || 0} />
            <span className="relative">m</span>
          </div>
        </h1>
        <TotalEarnings selectedView={selectedView} />
      </div>
      <div className="flex space-x-2">
        <TrackerPeriodSelect dateFormat="MMMM" />
        <TrackerSettings />
        <TrackerCalendarType selectedView={selectedView} />
      </div>
    </div>
  );
}
