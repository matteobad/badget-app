import type { ReactNode } from "react";

interface ConfigurableWidgetProps {
  isConfiguring: boolean;
  children: ReactNode;
  settings: ReactNode;
}

export function ConfigurableWidget({
  isConfiguring,
  children,
  settings,
}: ConfigurableWidgetProps) {
  if (isConfiguring) {
    return (
      <div className="flex h-[200px] flex-col border p-6 dark:border-[#1d1d1d] dark:bg-[#0c0c0c]">
        {settings}
      </div>
    );
  }

  return <>{children}</>;
}
