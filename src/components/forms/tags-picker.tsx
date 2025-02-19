"use client";

// Add the following to tailwind.config.ts: "./node_modules/emblor/dist/index.mjs",
import type { Tag } from "emblor";
import React, { useId, useState } from "react";
import { TagInput } from "emblor";

export default function TagsPicker({
  tags,
}: React.ComponentProps<typeof TagInput> & { tags: Tag[] }) {
  const id = useId();
  const [exampleTags, setExampleTags] = useState<Tag[]>(tags);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  return (
    <TagInput
      id={id}
      tags={exampleTags}
      setTags={(newTags) => {
        setExampleTags(newTags);
      }}
      placeholder="Add a tag"
      styleClasses={{
        inlineTagsContainer:
          "border-input bg-background focus-within:border-ring focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring/20 p-2 gap-1 h-10 w-full",
        input: "w-full sm:max-w-[350px] border-0 shadow-none p-1",
      }}
      activeTagIndex={activeTagIndex}
      setActiveTagIndex={setActiveTagIndex}
    />
  );
}
