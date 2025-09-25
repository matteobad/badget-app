import { IncomeWidget } from "./income/income-widget";
import { Widget, WidgetHeader, WidgetProvider, WidgetTitle } from "./widget";

type DashboardWidgetProps = {
  widget: {
    id: string;
    settings?: { period?: "month" };
  };
};

export function DashboardWidget({ widget }: DashboardWidgetProps) {
  const renderContent = () => {
    switch (widget.id) {
      case "income":
        return <IncomeWidget />;

      default:
        return (
          <Widget className="">
            <WidgetHeader>
              <WidgetTitle className="flex items-center gap-3">
                {widget.id}
              </WidgetTitle>
            </WidgetHeader>
          </Widget>
        );
    }
  };

  return <WidgetProvider>{renderContent()}</WidgetProvider>;
}
