"use client";

import { useDocumentFilterParams } from "~/hooks/use-document-filter-params";
import { FileIcon } from "lucide-react";

import { Button } from "../ui/button";

export function NoResults() {
  const { setFilter } = useDocumentFilterParams();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="-mt-[160px] flex flex-col items-center">
        <FileIcon className="mb-4" />
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-lg font-medium">No results</h2>
          <p className="text-sm text-[#606060]">Try another search term</p>
        </div>

        <Button variant="outline" onClick={() => setFilter(null)}>
          Clear search
        </Button>
      </div>
    </div>
  );
}
