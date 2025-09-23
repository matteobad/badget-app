"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";

export function useSpaceQuery() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.organization.current.queryOptions());
}

export function useSpaceMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.organization.update.mutationOptions({
      onMutate: async (newData) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: trpc.organization.current.queryKey(),
        });

        // Get current data
        const previousData = queryClient.getQueryData(
          trpc.organization.current.queryKey(),
        );

        // Optimistically update
        queryClient.setQueryData(
          trpc.organization.current.queryKey(),
          // @ts-expect-error bad types
          (old) => ({
            ...old,
            ...newData,
          }),
        );

        return { previousData };
      },
      onError: (_, __, context) => {
        // Rollback on error
        queryClient.setQueryData(
          trpc.organization.current.queryKey(),
          context?.previousData,
        );
      },
      onSettled: () => {
        // Refetch after error or success
        void queryClient.invalidateQueries({
          queryKey: trpc.organization.current.queryKey(),
        });

        void queryClient.invalidateQueries({
          queryKey: trpc.organization.list.queryKey(),
        });
      },
    }),
  );
}
