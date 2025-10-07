import { useLongPress } from "~/hooks/use-long-press";
import { cn } from "~/lib/utils";
import { GripVerticalIcon, SettingsIcon } from "lucide-react";

import { Skeleton } from "../ui/skeleton";
import { useIsCustomizing, useWidgetActions } from "./widget-provider";

interface BaseWidgetProps {
  title: string;
  description: React.ReactNode;
  onClick?: () => void;
  actions: React.ReactNode;
  icon: React.ReactNode;
  children?: React.ReactNode;
  onConfigure?: () => void;
  className?: string;
}

export function BaseWidget({
  children,
  onClick,
  title,
  description,
  actions,
  icon,
  onConfigure,
  className,
}: BaseWidgetProps) {
  const isCustomizing = useIsCustomizing();
  const { setIsCustomizing } = useWidgetActions();

  const longPressHandlers = useLongPress({
    onLongPress: () => setIsCustomizing(true),
    onClick,
    threshold: 500,
    disabled: isCustomizing,
  });

  return (
    <div
      className={cn(
        "group flex h-[200px] flex-col justify-between gap-2 border p-4 transition-all duration-300 dark:border-[#1d1d1d] dark:bg-[#0c0c0c] dark:hover:border-[#222222] dark:hover:bg-[#0f0f0f]",
        !isCustomizing && "cursor-pointer",
        className,
      )}
      {...longPressHandlers}
    >
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{icon}</span>
            <h3 className="text-xs font-medium text-muted-foreground lowercase first-letter:uppercase">
              {title}
            </h3>
          </div>
          {onConfigure && !isCustomizing && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onConfigure();
              }}
              onMouseDown={(e) => {
                // to prevent widget click handler
                e.stopPropagation();
              }}
              className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary"
            >
              <SettingsIcon className="size-3.5" />
            </button>
          )}
          {isCustomizing && (
            <GripVerticalIcon className="size-3.5 text-muted-foreground" />
          )}
        </div>

        {typeof description === "string" ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : (
          description
        )}
      </div>

      <div className="flex flex-1">{children}</div>
      <span className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-primary">
        {actions}
      </span>
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="group flex h-[200px] flex-col justify-between gap-2 border p-4 transition-all duration-300 dark:border-[#1d1d1d] dark:bg-[#0c0c0c] dark:hover:border-[#222222] dark:hover:bg-[#0f0f0f]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4" />
            <Skeleton className="h-3 w-[120px]" />
          </div>
        </div>
      </div>

      <div className="flex flex-1" />
      <Skeleton className="h-3 w-[100px]" />
    </div>
  );
}
