"use client";

// Add the following to tailwind.config.ts: "./node_modules/emblor/dist/index.mjs",
import React from "react";
import { createId } from "@paralleldrive/cuid2";
import { TagInput } from "emblor";

export default function TagsPicker({
  ...props
}: React.ComponentProps<typeof TagInput>) {
  return (
    <TagInput
      {...props}
      generateTagId={() => createId()}
      styleClasses={{
        inlineTagsContainer:
          "border-input bg-background focus-within:border-ring focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring/20 p-1 gap-1 h-10 w-full",
        input: "w-full sm:max-w-[350px] border-0 shadow-none p-1",
        tag: {
          body: "h-7 relative bg-background border border-input hover:bg-background rounded-md font-medium text-xs ps-2 pe-7",
          closeButton:
            "absolute -inset-y-px -end-px p-0 rounded-e-lg flex size-7 transition-colors outline-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 text-muted-foreground/80 hover:text-foreground",
        },
      }}
    />
  );
}
