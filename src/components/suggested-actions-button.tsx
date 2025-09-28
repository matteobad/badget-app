"use client";

import type React from "react";
import { useChatStore } from "~/lib/stores/chat";
import { cn } from "~/lib/utils";
import { BoltIcon, ZapIcon } from "lucide-react";

export function SuggestedActionsButton() {
  const { showCommands, setShowCommands } = useChatStore();

  const handleClick = (e: React.MouseEvent) => {
    // Prevent the click from bubbling up and being detected as an "outside click"
    e.stopPropagation();

    // Toggle the command menu
    setShowCommands(!showCommands);

    // Focus textarea for keyboard navigation when opening
    if (!showCommands) {
      requestAnimationFrame(() => {
        document.querySelector("textarea")?.focus();
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-6 cursor-pointer items-center transition-colors duration-200"
      // Add data attribute to help identify this button for exclusion from outside clicks
      data-suggested-actions-toggle
    >
      <ZapIcon
        size={16}
        className={cn(
          "transition-colors",
          showCommands
            ? "text-black dark:text-white"
            : "text-[#707070] hover:text-[#999999] dark:text-[#666666] dark:hover:text-[#999999]",
        )}
      />
    </button>
  );
}
