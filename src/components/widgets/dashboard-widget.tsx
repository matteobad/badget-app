import { cn } from "~/lib/utils";

import { IncomeWidget } from "./income/income-widget";
import { Widget, WidgetHeader, WidgetProvider, WidgetTitle } from "./widget";

type DashboardWidgetProps = {
  widget: {
    id: string;
    settings?: { period?: "month" };
  };
  className?: string;
  isEditMode: boolean;
};

export function DashboardWidget({
  widget,
  className,
  isEditMode,
}: DashboardWidgetProps) {
  const renderContent = () => {
    switch (widget.id) {
      case "income":
        return <IncomeWidget />;

      default:
        return (
          <WidgetProvider>
            <Widget className="">
              <WidgetHeader>
                <WidgetTitle className="flex items-center gap-3">
                  {widget.id}
                </WidgetTitle>
              </WidgetHeader>
            </Widget>
          </WidgetProvider>
        );
    }
  };

  return (
    <div
      className={cn(className, {
        "[&_[data-slot=widget-settings-trigger]]:opacity-0": isEditMode,
        "[&_[data-slot=widget-action]]:!text-muted-foreground/60": isEditMode,
      })}
    >
      {renderContent()}
    </div>
  );
}
