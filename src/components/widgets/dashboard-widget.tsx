import { cn } from "~/lib/utils";

import { CategoryExpensesWidget } from "./category-expenses/category-expenses-widget";
import { IncomeWidget } from "./income/income-widget";
import { MonthlySpendingWidget } from "./monthly-spending/monthly-spending-widget";
import { NetWorthWidget } from "./net-worth/net-worth-widget";
import { RecurringWidget } from "./recurring/recurring-widget";
import { UncategorizedWidget } from "./uncategorized-widget/uncategorized-widget";
import { Widget, WidgetHeader, WidgetProvider, WidgetTitle } from "./widget";

type DashboardWidgetProps = {
  widget: {
    id: string;
    settings?: any; // can we type this?
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
        return <IncomeWidget {...widget.settings} />;
      case "category-expenses":
        return <CategoryExpensesWidget {...widget.settings} />;
      case "monthly-spending":
        return <MonthlySpendingWidget {...widget.settings} />;
      case "net-worth":
        return <NetWorthWidget {...widget.settings} />;
      case "recurring":
        return <RecurringWidget {...widget.settings} />;
      case "uncategorized":
        return <UncategorizedWidget {...widget.settings} />;

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
