import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import React, { useRef, useState } from "react";
import { arrayMove } from "@dnd-kit/helpers";
import {
  DragDropProvider,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
} from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useOnClickOutside } from "usehooks-ts";

import { AccountBalancesWidget } from "./account-balances-widget";
import { CashFlowWidget } from "./cash-flow-widget";
import { CategoryExpensesWidget } from "./category-expenses-widget";
import { IncomeForecastWidget } from "./income-forecast-widget";
import { Insights } from "./insight";
import { MonthlyIncomeWidget } from "./monthly-income-widget";
import { MonthlySpendingWidget } from "./monthly-spending-widget";
import { NetWorthWidget } from "./net-worth-widget";
import { RecentDocumentsWidget } from "./recent-documents-widget";
import { RecurringExpensesWidget } from "./recurring-expenses-widget";
import { SavingAnalysisWidget } from "./saving-analysis-widget";
import { UncategorizedTransactionsWidget } from "./uncategorized-transactions-widget";
import {
  useAvailableWidgets,
  useIsCustomizing,
  usePrimaryWidgets,
  useWidgetActions,
} from "./widget-provider";

type WidgetPreferences = RouterOutput["widgets"]["getWidgetPreferences"];
type WidgetType = WidgetPreferences["primaryWidgets"][number];

// Sortable Card Component
function SortableCard({
  id,
  index,
  children,
  className,
  wiggleClass,
}: {
  id: string;
  index: number;
  children: React.ReactNode;
  className: string;
  customizeMode: boolean;
  wiggleClass?: string;
}) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    // transition: {
    //   duration: 0, // Animation duration in ms
    //   easing: "cubic-bezier(0.25, 1, 0.5, 1)", // Animation easing
    //   idle: false, // Whether to animate when no drag is in progress
    // },
  });

  return (
    <div
      ref={ref}
      data-id={index}
      data-dragging={isDragging}
      className={`${className} ${wiggleClass ?? ""} ${
        isDragging
          ? "z-50 scale-105 opacity-100 shadow-[0_4px_12px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
          : ""
      } relative`}
    >
      {children}
    </div>
  );
}

// Widget mapping to components
const WIDGET_COMPONENTS: Record<WidgetType, React.ComponentType> = {
  "account-balances": AccountBalancesWidget,
  "cash-flow": CashFlowWidget,
  "category-expenses": CategoryExpensesWidget,
  "monthly-income": MonthlyIncomeWidget,
  "monthly-spending": MonthlySpendingWidget,
  "net-worth": NetWorthWidget,
  "recurring-expenses": RecurringExpensesWidget,
  "saving-analysis": SavingAnalysisWidget,
  "uncategorized-transactions": UncategorizedTransactionsWidget,
  "recent-documents": RecentDocumentsWidget,
  "income-forecast": IncomeForecastWidget,
};

export function WidgetsGrid() {
  const trpc = useTRPC();
  const [activeId, setActiveId] = useState<any | null>(null);
  const gridRef = useRef<HTMLDivElement>(null!);

  const isCustomizing = useIsCustomizing();
  const primaryWidgets = usePrimaryWidgets();
  const availableWidgets = useAvailableWidgets();
  const { setIsCustomizing } = useWidgetActions();

  const {
    reorderPrimaryWidgets,
    moveToAvailable,
    moveToPrimary,
    swapWithLastPrimary,
    setSaving,
  } = useWidgetActions();

  // Handle click outside to disable customizing
  useOnClickOutside(gridRef, (event) => {
    if (isCustomizing) {
      // Don't close if clicking on element with data-no-close
      const target = event.target as Element;
      if (!target.closest("[data-no-close]")) {
        setIsCustomizing(false);
      }
    }
  });

  // Auto-save when primary widgets change
  const updatePreferencesMutation = useMutation(
    trpc.widgets.updateWidgetPreferences.mutationOptions({
      onMutate: () => {
        setSaving(true);
      },
      onSettled: () => {
        setSaving(false);
      },
    }),
  );

  const WidgetComponent = WIDGET_COMPONENTS[activeId as WidgetType];

  return (
    <DragDropProvider
      // Custom input detection
      sensors={[PointerSensor, KeyboardSensor]}
      onBeforeDragStart={(event) => {
        // Optionally prevent dragging
        if (!isCustomizing) event.preventDefault();
      }}
      onDragStart={(event) => {
        const { operation } = event;
        const id = operation.source?.id;
        console.log(`Started dragging ${id}`);
        setActiveId(id);
      }}
      onDragEnd={(event) => {
        const { operation, canceled } = event;
        const { source, target } = operation;

        if (!source || !target) {
          setActiveId(null);
          return;
        }

        if (canceled) {
          // Replaces onDragCancel
          console.log(`Cancelled dragging ${source.id}`);
          return;
        }

        console.log(`Dropped ${source.id} over ${target.id}`);
        // Access rich data
        console.log("Source data:", source.data);
        console.log("Drop position:", operation.position.current);

        const activeId = source.id as WidgetType;
        const overId = target.id as WidgetType;

        // Find which section the active widget is in
        const activeInPrimary = primaryWidgets.includes(activeId);
        const activeInAvailable = availableWidgets.includes(activeId);
        const overInPrimary = primaryWidgets.includes(overId);
        const overInAvailable = availableWidgets.includes(overId);

        // Reordering within primary
        if (activeInPrimary && overInPrimary) {
          const activeIndex = primaryWidgets.indexOf(activeId);
          const overIndex = primaryWidgets.indexOf(overId);

          if (activeIndex !== overIndex) {
            const newOrder = arrayMove(primaryWidgets, activeIndex, overIndex);
            reorderPrimaryWidgets(newOrder);
            setTimeout(() => {
              updatePreferencesMutation.mutate({ primaryWidgets: newOrder });
            }, 100);
          }
        }
        // Moving from available to primary
        else if (activeInAvailable && overInPrimary) {
          const overIndex = primaryWidgets.indexOf(overId);
          const insertIndex =
            overIndex >= 0 ? overIndex : primaryWidgets.length;

          if (primaryWidgets.length >= 7) {
            // Swap with last primary widget
            swapWithLastPrimary(activeId, insertIndex);
            const newPrimary = [...primaryWidgets.slice(0, -1)];
            newPrimary.splice(insertIndex, 0, activeId);

            setTimeout(() => {
              updatePreferencesMutation.mutate({ primaryWidgets: newPrimary });
            }, 100);
          } else {
            // Insert at the specific position where dropped
            const newPrimary = [...primaryWidgets];
            newPrimary.splice(insertIndex, 0, activeId);

            moveToPrimary(activeId, newPrimary);

            setTimeout(() => {
              updatePreferencesMutation.mutate({ primaryWidgets: newPrimary });
            }, 100);
          }
        }
        // Moving from primary to available
        else if (activeInPrimary && overInAvailable) {
          moveToAvailable(activeId);
          const newPrimary = primaryWidgets.filter((w) => w !== activeId);
          setTimeout(() => {
            updatePreferencesMutation.mutate({ primaryWidgets: newPrimary });
          }, 100);
        }

        setActiveId(null);
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
    >
      <div ref={gridRef} className="space-y-8">
        {/* Primary Widgets */}
        {isCustomizing ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Insights />
            {primaryWidgets.map((widgetType, index) => {
              const WidgetComponent = WIDGET_COMPONENTS[widgetType];
              const wiggleClass = "animate-shake";

              return (
                <SortableCard
                  key={widgetType}
                  id={widgetType}
                  index={index}
                  className="relative cursor-grab active:cursor-grabbing"
                  customizeMode={isCustomizing}
                  wiggleClass={wiggleClass}
                >
                  <WidgetComponent />
                </SortableCard>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Insights />

            {primaryWidgets.map((widgetType) => {
              const WidgetComponent = WIDGET_COMPONENTS[widgetType];
              return <WidgetComponent key={widgetType} />;
            })}
          </div>
        )}

        {/* Separator and Available Widgets (shown when customizing) */}
        {isCustomizing && availableWidgets.length > 0 && (
          <>
            {/* Visual Separator */}
            <div className="my-8">
              <div className="border-t border-dashed border-border" />
            </div>

            {/* Available Widgets - Draggable */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {availableWidgets.map((widgetType, index) => {
                const WidgetComponent = WIDGET_COMPONENTS[widgetType];
                const wiggleClass = "animate-shake";

                return (
                  <SortableCard
                    key={widgetType}
                    id={widgetType}
                    index={index}
                    className="cursor-grab opacity-60 hover:opacity-70 active:cursor-grabbing"
                    customizeMode={isCustomizing}
                    wiggleClass={wiggleClass}
                  >
                    <WidgetComponent />
                  </SortableCard>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* TODO: disable animation of first render */}
      <DragOverlay>
        {(_source) =>
          activeId ? (
            <div className="transform-gpu cursor-grabbing bg-background opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.15)] will-change-transform dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
              {" "}
              <WidgetComponent />
            </div>
          ) : null
        }
      </DragOverlay>
    </DragDropProvider>
  );
}
