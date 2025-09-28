import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { toast } from "sonner";

import { CategoryExpensesWidget } from "./category-expenses/category-expenses-widget";
import { IncomeAnalysisWidget } from "./income-analysis/income-analysis-widget";
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
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateUserWidgetMutation = useMutation(
    trpc.preferences.updateUserWidget.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.preferences.getUserWidgets.queryKey(),
        });
      },
    }),
  );

  const handleSettingsChange = (id: string, newSettings: any) => {
    updateUserWidgetMutation.mutate({
      id: "income",
      settings: newSettings,
    });
  };

  const renderContent = () => {
    switch (widget.id) {
      case "category-expenses":
        return <CategoryExpensesWidget />;
      case "income":
        return <IncomeWidget />;
      case "income-analysis":
        return <IncomeAnalysisWidget />;
      case "monthly-spending":
        return <MonthlySpendingWidget />;
      case "net-worth":
        return <NetWorthWidget />;
      case "recurring":
        return <RecurringWidget />;
      case "uncategorized":
        return <UncategorizedWidget />;

      default:
        return (
          <Widget>
            <WidgetHeader>
              <WidgetTitle className="flex items-center gap-3">
                {widget.id}
              </WidgetTitle>
            </WidgetHeader>
          </Widget>
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
      <WidgetProvider
        id={widget.id}
        settings={widget.settings}
        onSettingsChange={handleSettingsChange}
      >
        {renderContent()}
      </WidgetProvider>
    </div>
  );
}
