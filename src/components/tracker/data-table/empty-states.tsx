"use client";

import { Button } from "~/components/ui/button";
import { useTrackerFilterParams } from "~/hooks/use-tracker-filter-params";
import { useTrackerParams } from "~/hooks/use-tracker-params";

export function EmptyState() {
  const { setParams } = useTrackerParams();

  return (
    <div className="flex h-[350px] items-center justify-center">
      <div className="-mt-20 flex flex-col items-center">
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-lg font-medium">No projects</h2>
          <p className="text-sm text-[#606060]">
            You haven&apos;t created any projects yet. <br />
            Go ahead and create your first one.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            setParams({
              create: true,
            })
          }
        >
          Create project
        </Button>
      </div>
    </div>
  );
}

export function NoResults() {
  const { setFilter } = useTrackerFilterParams();

  return (
    <div className="flex h-[350px] items-center justify-center">
      <div className="-mt-20 flex flex-col items-center">
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-lg font-medium">No results</h2>
          <p className="text-sm text-[#606060]">
            Try another search, or adjusting the filters
          </p>
        </div>

        <Button variant="outline" onClick={() => setFilter(null)}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}
