import type { Metadata } from "next";
import { Suspense } from "react";
import { DataTable } from "~/components/tag/table/data-table";
import { TagsSkeleton } from "~/components/tag/table/data-table-skeleton";
import { TagsActions } from "~/components/tag/tags-actions";
import { TagsSearchFilter } from "~/components/tag/tags-search-filter";
import { HydrateClient, prefetch, trpc } from "~/shared/helpers/trpc/server";

export const metadata: Metadata = {
  title: "Tags | Midday",
};

export default async function TagsPage() {
  prefetch(trpc.transactionTag.get.queryOptions());

  return (
    <div className="flex max-w-screen-lg flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <TagsSearchFilter />
        <TagsActions />
      </header>
      <HydrateClient>
        <Suspense fallback={<TagsSkeleton />}>
          <DataTable />
        </Suspense>
      </HydrateClient>
    </div>
  );
}
