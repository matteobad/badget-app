"use client";

import { useChatInterface } from "~/hooks/use-chat-interface";
import type { RouterOutput } from "~/server/api/trpc/routers/_app";

import { WidgetProvider } from "./widget-provider";
import { WidgetsGrid } from "./widgets-grid";
import { WidgetsHeader } from "./widgets-header";

type WidgetPreferences = RouterOutput["widgets"]["getWidgetPreferences"];

function WidgetsContent() {
  const { isChatPage } = useChatInterface();
  // const isCustomizing = useIsCustomizing();

  if (isChatPage) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col">
      <WidgetsHeader />
      <WidgetsGrid />
      {/* {!isCustomizing && (
        <Suspense fallback={<SuggestedActionsSkeleton />}>
          <SuggestedActions />
        </Suspense>
      )} */}
    </div>
  );
}

interface WidgetsProps {
  initialPreferences: WidgetPreferences;
}

export function Widgets({ initialPreferences }: WidgetsProps) {
  const { isChatPage } = useChatInterface();

  if (isChatPage) {
    return null;
  }

  return (
    <WidgetProvider initialPreferences={initialPreferences}>
      <WidgetsContent />
    </WidgetProvider>
  );
}
