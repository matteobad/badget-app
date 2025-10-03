"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { trackingConsentAction } from "~/server/actions";
import { useAction } from "next-safe-action/hooks";

import { Button } from "./ui/button";

export function ConsentBanner() {
  const [isOpen, setOpen] = useState(true);
  const trackingAction = useAction(trackingConsentAction, {
    onExecute: () => setOpen(false),
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-2 left-2 z-50 flex w-[calc(100vw-16px)] max-w-[420px] flex-col space-y-4 border border-border bg-background p-4 transition-all md:bottom-4 md:left-4",
        isOpen &&
          "animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-full",
      )}
    >
      <div className="text-sm">
        This site uses tracking technologies. You may opt in or opt out of the
        use of these technologies.
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          className="h-8 rounded-full"
          onClick={() => trackingAction.execute(false)}
        >
          Deny
        </Button>
        <Button
          className="h-8 rounded-full"
          onClick={() => trackingAction.execute(true)}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
