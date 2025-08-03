"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useState } from "react";
import { SubmitButton } from "~/components/submit-button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { TableRow as BaseTableRow, TableCell } from "~/components/ui/table";

type Props = {
  row: RouterOutput["organization"]["list"][number];
};

export function TableRow({ row }: Props) {
  // const queryClient = useQueryClient();
  const [isLoading] = useState(false);
  // const trpc = useTRPC();
  // const router = useRouter();

  // const changeTeamMutation = useMutation(
  //   trpc.user.update.mutationOptions({
  //     onMutate: () => {
  //       setIsLoading(true);
  //     },
  //     onSuccess: () => {
  //       queryClient.invalidateQueries();
  //       router.push("/");
  //     },
  //     onError: () => {
  //       setIsLoading(false);
  //     },
  //   }),
  // );

  return (
    <BaseTableRow key={row.id} className="hover:bg-transparent">
      <TableCell className="border-r-[0px] px-0 py-4">
        <div className="flex items-center space-x-4">
          <Avatar className="size-8 rounded-none">
            {row.logo && (
              <AvatarImage
                src={row.logo}
                alt={row.name ?? ""}
                width={32}
                height={32}
              />
            )}
            <AvatarFallback className="rounded-none">
              <span className="text-xs">
                {row?.name?.charAt(0)?.toUpperCase()}
              </span>
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row?.name}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-0">
        <div className="flex justify-end">
          <div className="flex items-center space-x-3">
            <SubmitButton
              isSubmitting={isLoading}
              variant="outline"
              onClick={() => {
                // changeTeamMutation.mutate({
                //   teamId: row.id!,
                // });
              }}
            >
              Launch
            </SubmitButton>
          </div>
        </div>
      </TableCell>
    </BaseTableRow>
  );
}
