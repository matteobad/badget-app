"use client";

import { useChatInterface } from "~/hooks/use-chat-interface";

import { SuggestedActions } from "../suggested-actions";
import { WidgetsGrid } from "./widgets-grid";
import { WidgetsHeader } from "./widgets-header";

export function Widgets() {
  const { isChatPage } = useChatInterface();

  // if (isChatPage) {
  //   return null;
  // }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <WidgetsHeader />
      <WidgetsGrid />
      <SuggestedActions />
    </div>
  );
}
