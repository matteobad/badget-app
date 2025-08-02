import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubmitButton } from "~/components/submit-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { Loader2, MoreHorizontal } from "lucide-react";

import type { ColumnDef, FilterFn, Row } from "@tanstack/react-table";

const teamNameFilterFn: FilterFn<
  RouterOutput["organization"]["list"][number]
> = (
  row: Row<RouterOutput["organization"]["list"][number]>,
  _: string,
  filterValue: string,
) => {
  const teamName = row.original.name?.toLowerCase();

  return teamName?.includes(filterValue.toLowerCase()) ?? false;
};

export const columns: ColumnDef<
  RouterOutput["organization"]["list"][number]
>[] = [
  {
    id: "team",
    accessorKey: "team.name",
    filterFn: teamNameFilterFn,
    cell: ({ row }) => {
      const t = useI18n();

      return (
        <div className="flex items-center space-x-4">
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarImage
              src={row.original.logo ?? ""}
              alt={row.original.name ?? ""}
              width={32}
              height={32}
            />
            <AvatarFallback>
              <span className="text-xs">
                {row.original.name?.charAt(0)?.toUpperCase()}
              </span>
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.original.name}</span>
            <span className="text-sm text-[#606060]">
              {/* @ts-expect-error */}
              {t(`roles.${row.original.role}`)}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const trpc = useTRPC();
      const queryClient = useQueryClient();
      const router = useRouter();

      const viewTeamMutation = useMutation(
        trpc.user.update.mutationOptions({
          onSuccess: () => {
            queryClient.invalidateQueries();
          },
        }),
      );

      const manageTeamMutation = useMutation(
        trpc.user.update.mutationOptions({
          onSuccess: () => {
            queryClient.invalidateQueries();
          },
        }),
      );

      const leaveTeamMutation = useMutation(
        trpc.team.leave.mutationOptions({
          onError: () => {
            toast({
              duration: 6000,
              variant: "error",
              title:
                "You cannot leave since you are the only remaining owner of the team. Delete this team instead.",
            });
          },
        }),
      );

      return (
        <div className="flex justify-end">
          <div className="flex items-center space-x-3">
            <SubmitButton
              variant="outline"
              isSubmitting={viewTeamMutation.isPending}
              onClick={() =>
                viewTeamMutation.mutate(
                  {
                    teamId: row.original.id,
                  },
                  {
                    onSuccess: () => {
                      router.push("/");
                    },
                  },
                )
              }
            >
              View
            </SubmitButton>
            {row.original.role === "owner" && (
              <SubmitButton
                variant="outline"
                isSubmitting={manageTeamMutation.isPending}
                onClick={() =>
                  manageTeamMutation.mutate(
                    {
                      teamId: row.original.id,
                    },
                    {
                      onSuccess: () => {
                        router.push("/settings");
                      },
                    },
                  )
                }
              >
                Manage
              </SubmitButton>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <DropdownMenuItem
                    className="text-destructive"
                    asDialogTrigger
                  >
                    <AlertDialogTrigger>Leave Team</AlertDialogTrigger>
                  </DropdownMenuItem>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave Team</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to leave this team. In order to regain
                        access at a later time, a Team Owner must invite you.
                        <p className="mt-4">
                          Are you sure you want to continue?
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={leaveTeamMutation.isPending}
                        onClick={() =>
                          leaveTeamMutation.mutate({
                            teamId: row.original.id,
                          })
                        }
                      >
                        {leaveTeamMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Confirm"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      );
    },
    meta: {
      className: "text-right",
    },
  },
];
