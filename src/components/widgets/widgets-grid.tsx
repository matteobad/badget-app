import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import React, { useEffect, useState } from "react";
import { swap } from "@dnd-kit/helpers";
import {
  DragDropProvider,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
} from "@dnd-kit/react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useWidgetParams } from "~/hooks/use-widget-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { toast } from "sonner";

import { Skeleton } from "../ui/skeleton";
import { DashboardWidget } from "./dashboard-widget";
import { SortableItem } from "./sortable-item";

type Widget = RouterOutput["preferences"]["getUserWidgets"][number];

export function WidgetsGridSkeleton() {
  return (
    <div className="grid max-h-[400px] grid-cols-1 gap-6 overflow-hidden pt-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from(new Array(8), (_) => (
        <div className="flex h-full min-h-44 w-full flex-col justify-between gap-1 border bg-card p-4">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      ))}
    </div>
  );
}

export function WidgetsGrid() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [draggegWidget, setDraggedWidget] = useState<Widget>({ id: "widget" });

  const { params } = useWidgetParams();
  const isEditMode = !!params.isEditing;

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.preferences.getUserWidgets.queryOptions(),
  );

  const updateUserWidgets = useMutation(
    trpc.preferences.updateUserWidgets.mutationOptions({
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

  useEffect(() => {
    if (data) setWidgets(data);
  }, [data]);

  return (
    <DragDropProvider
      // Custom input detection
      sensors={[PointerSensor, KeyboardSensor]}
      onBeforeDragStart={(event) => {
        // Optionally prevent dragging
        if (!isEditMode) event.preventDefault();
      }}
      onDragStart={(event) => {
        const { operation } = event;
        const id = operation.source?.id;
        console.log(`Started dragging ${operation.source?.id}`);
        const draggedItem = widgets.find((w) => w.id === id);

        if (draggedItem) setDraggedWidget(draggedItem);
      }}
      onDragEnd={(event) => {
        setDraggedWidget({ id: "widget" });

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
          const newWidgets = swap(widgets, event);
          setWidgets(newWidgets);
          updateUserWidgets.mutate({ widgets: newWidgets });
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
    >
      <div
        className={cn(
          "-mx-1 grid max-h-[400px] grid-cols-1 gap-6 overflow-hidden px-1 pt-4 md:grid-cols-2 lg:grid-cols-4",
          { "max-h-auto [&>[role=button]>div]:animate-shake": isEditMode },
        )}
      >
        {widgets?.map((widget, index) => {
          return (
            <React.Fragment key={widget.id}>
              <SortableItem id={widget.id} index={index}>
                <DashboardWidget
                  widget={widget}
                  className={cn("transition-opacity", {
                    "opacity-60": index > 7,
                    "shadow-lg": widget.id === draggegWidget.id && isEditMode,
                    "hover:shadow-lg": isEditMode,
                  })}
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

      {/* TODO: disable animation of first render */}
      <DragOverlay>
        {(_source) => (
          <DashboardWidget
            className={cn("opacity-80 shadow-lg", {
              hidden: draggegWidget.id === "widget",
            })}
            widget={draggegWidget}
            isEditMode={true}
          />
        )}
      </DragOverlay>
    </DragDropProvider>
  );
}
