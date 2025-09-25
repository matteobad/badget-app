"use client";

import React, { useState } from "react";
import { move } from "@dnd-kit/helpers";
import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from "@dnd-kit/react";
import { cn } from "~/lib/utils";

import { DashboardWidget } from "./dashboard-widget";
import { DroppableGrid } from "./droppable";
import { SortableItem } from "./sortable-item";
import { WidgetsHeader } from "./widgets-header";

interface Widget {
  id: string;
  settings?: { period?: "month" };
}

const initialWidgets: Widget[] = [
  {
    id: "insights",
  },
  {
    id: "income",
  },
  {
    id: "profit-analysis",
  },
  {
    id: "file-management",
  },
  {
    id: "outstanding-vat",
  },
  {
    id: "monthly-spending",
  },
  {
    id: "revenue-year",
  },
  {
    id: "software-costs",
  },
  {
    id: "forecast",
  },
  {
    id: "category-expenses",
  },
  {
    id: "taxes",
  },
  {
    id: "top-customers",
  },
  {
    id: "profit-margin",
  },
  {
    id: "cash-flow",
  },
  {
    id: "growth-rate",
  },
  {
    id: "payroll",
  },
];

export function Widgets() {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <WidgetsHeader
        isCustomizing={isEditMode}
        onToggle={() => setIsEditMode(!isEditMode)}
      />

      <DragDropProvider
        // Custom input detection
        sensors={[PointerSensor, KeyboardSensor]}
        onBeforeDragStart={(event) => {
          // Optionally prevent dragging
          if (!isEditMode) event.preventDefault();
        }}
        onDragStart={(event, manager) => {
          const { operation } = event;
          console.log(`Started dragging ${operation.source?.id}`);
        }}
        onDragEnd={(event, manager) => {
          const { operation, canceled } = event;
          const { source, target } = operation;

          if (canceled) {
            // Replaces onDragCancel
            console.log(`Cancelled dragging ${source?.id}`);
            return;
          }

          if (target) {
            console.log(`Dropped ${source?.id} over ${target.id}`);
            // Access rich data
            console.log("Source data:", source?.data);
            console.log("Drop position:", operation.position.current);
          }
        }}
        onDragOver={(event) => {
          setWidgets((items) => move(items, event));
        }}
      >
        <DroppableGrid id="active">
          <div
            className={cn(
              "grid max-h-[400px] grid-cols-1 gap-6 overflow-hidden px-6 pt-4 md:grid-cols-2 lg:grid-cols-4",
              { "max-h-auto [&>[role=button]]:animate-shake": isEditMode },
            )}
          >
            {widgets.map((widget, index) => {
              return (
                <React.Fragment key={widget.id}>
                  <SortableItem key={widget.id} id={widget.id} index={index}>
                    <DashboardWidget
                      widget={widget}
                      className={index > 7 ? "opacity-60" : "opacity-100"}
                      isEditMode={isEditMode}
                    />
                  </SortableItem>
                  {index === 7 && (
                    <div className="my-2 border-t border-dashed md:col-span-2 lg:col-span-4" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </DroppableGrid>
      </DragDropProvider>
    </div>
  );
}
