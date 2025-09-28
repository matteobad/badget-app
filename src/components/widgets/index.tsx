"use client";

import React, { Suspense } from "react";
import { useChatInterface } from "~/hooks/use-chat-interface";

import {
  SuggestedActions,
  SuggestedActionsSkeleton,
} from "../suggested-actions";
import { WidgetsGrid, WidgetsGridSkeleton } from "./widgets-grid";
import { WidgetsHeader } from "./widgets-header";

export function Widgets() {
  const { isChatPage } = useChatInterface();

  if (isChatPage) {
    return null;
  }

  return (
    <div className="relative flex flex-col gap-4 bg-background">
      <WidgetsHeader />

      <Suspense fallback={<WidgetsGridSkeleton />}>
        <WidgetsGrid />
      </Suspense>

      <Suspense fallback={<SuggestedActionsSkeleton />}>
        <SuggestedActions />
      </Suspense>
    </div>
  );
}
