"use client";

import { ReceiptIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

// import { AddAccountButton } from "@/components/add-account-button";

export function NoResults() {
  return (
    <div className="flex h-[calc(100vh-300px)] items-center justify-center">
      <div className="flex flex-col items-center">
        <ReceiptIcon className="mb-4" />
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-lg font-medium">No results</h2>
          <p className="text-sm text-[#606060]">
            Try another search, or adjusting the filters
          </p>
        </div>

        <Button variant="outline">Clear filters</Button>
      </div>
    </div>
  );
}

export function NoTags() {
  return (
    <div className="absolute top-0 left-0 z-20 flex h-[calc(100vh-300px)] w-full items-center justify-center">
      <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-medium">No tags</h2>
        <p className="mb-6 text-sm text-[#878787]">
          Create tags to organize and categorize your transactions, making it
          easier to track your spending and gain valuable insights into your
          financial habits.
        </p>

        {/* <AddAccountButton /> */}
      </div>
    </div>
  );
}
