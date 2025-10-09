"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useTagParams } from "~/hooks/use-tag-params";

export function TagsActions() {
  const { setParams } = useTagParams();
  return (
    <div className="flex items-center justify-between">
      <Button
        onClick={() => {
          void setParams({ createTag: true });
        }}
      >
        <PlusIcon className="size-4" />
        Create Tag
      </Button>
    </div>
  );
}
