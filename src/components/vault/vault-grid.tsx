"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useDocumentFilterParams } from "~/hooks/use-document-filter-params";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { LoadMore } from "../load-more";
import { NoResults } from "./empty-states";
import { VaultGetStarted } from "./vault-get-started";
import { VaultItem } from "./vault-item";

export function VaultGrid() {
  const trpc = useTRPC();
  const { ref, inView } = useInView();

  const { filter, hasFilters } = useDocumentFilterParams();

  const infiniteQueryOptions = trpc.documents.get.infiniteQueryOptions(
    {
      pageSize: 20,
      ...filter,
    },
    {
      getNextPageParam: ({ meta }) => meta?.cursor,
    },
  );

  const { data, fetchNextPage, hasNextPage, isFetching } =
    useSuspenseInfiniteQuery(infiniteQueryOptions);

  const documents = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  if (hasFilters && !documents?.length) {
    return <NoResults />;
  }

  if (!documents?.length && !isFetching) {
    return <VaultGetStarted />;
  }

  return (
    <div>
      <div className="3xl:grid-cols-6 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {documents.map((document) => (
          // @ts-expect-error types
          <VaultItem key={document.id} data={document} />
        ))}
      </div>

      <LoadMore ref={ref} hasNextPage={hasNextPage} />
    </div>
  );
}
