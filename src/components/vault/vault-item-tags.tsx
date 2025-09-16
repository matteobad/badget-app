"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useDocumentFilterParams } from "~/hooks/use-document-filter-params";

import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

type Props = {
  tags: RouterOutput["documents"]["get"]["data"][number]["documentTagAssignments"];
  isLoading: boolean;
};

export function VaultItemTags({ tags, isLoading }: Props) {
  const { setFilter } = useDocumentFilterParams();

  if (isLoading) {
    return (
      <div className="scrollbar-hide mt-auto flex gap-2 overflow-x-auto pb-2">
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
        {[...Array(3)].map((_, index) => (
          <Skeleton
            key={index.toString()}
            className={`h-6 rounded-full ${
              index % 3 === 0 ? "w-16" : index % 3 === 1 ? "w-20" : "w-24"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="scrollbar-hide mt-auto flex gap-2 overflow-x-auto pb-2">
      {tags?.map((tag) => (
        <button
          key={tag.documentTag.id}
          type="button"
          onClick={() => {
            void setFilter({
              tags: [tag.documentTag.id],
            });
          }}
        >
          <Badge
            variant="tag-rounded"
            className="shrink-0 text-[10px] whitespace-nowrap"
          >
            {tag.documentTag.name}
          </Badge>
        </button>
      ))}
    </div>
  );
}
