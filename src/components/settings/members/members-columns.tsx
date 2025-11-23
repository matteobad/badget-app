import type { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
import { Loader2, MoreHorizontal } from "lucide-react";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImageNext,
} from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useI18n } from "~/shared/locales/client";

type TeamMember = RouterOutput["space"]["listMembers"]["members"][number];

const userFilterFn: FilterFn<TeamMember> = (
  row: Row<TeamMember>,
  _: string,
  filterValue: string,
) => {
  const memberName = row.original.user?.name?.toLowerCase();

  return memberName?.includes(filterValue.toLowerCase()) ?? false;
};

export const columns: ColumnDef<TeamMember>[] = [
  {
    id: "user",
    accessorKey: "user.full_name",
    filterFn: userFilterFn,
    cell: ({ row }) => {
      return (
        <div>
          <div className="flex items-center space-x-4">
            <Avatar className="rounded-full w-8 h-8">
              <AvatarImageNext
                src={row.original.user?.image ?? ""}
                alt={row.original.user?.name ?? ""}
                width={32}
                height={32}
              />
              <AvatarFallback>
                <span className="text-xs">
                  {row.original.user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {row.original.user?.name}
              </span>
              <span className="text-sm text-[#606060]">
                {row.original.user?.email}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const t = useI18n();
      const meta = table.options.meta;
      const trpc = useTRPC();
      const queryClient = useQueryClient();
      const router = useRouter();

      const removeMemberMutation = useMutation(
        trpc.space.removeMember.mutationOptions({
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: trpc.space.listMembers.queryKey(),
            });
          },
          onError: () => {
            toast.error("Error deleting member");
          },
        }),
      );

      const leaveSpaceMutation = useMutation(
        trpc.space.leave.mutationOptions({
          onSuccess: async () => {
            router.push("/spaces");
          },
        }),
      );

      const updateMemberRoleMutation = useMutation(
        trpc.space.updateMemberRole.mutationOptions({
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: trpc.space.listMembers.queryKey(),
            });
          },
        }),
      );

      return (
        <div className="flex justify-end">
          <div className="flex space-x-2 items-center">
            {(meta?.currentUser?.role === "owner" &&
              meta?.currentUser?.user?.id !== row.original.user?.id) ||
            (meta?.currentUser?.role === "owner" &&
              (meta?.totalOwners ?? 0) > 1) ? (
              <Select
                value={row.original.role ?? undefined}
                onValueChange={(role) => {
                  updateMemberRoleMutation.mutate({
                    memberId: row.original.user.id,
                    role: role as "owner" | "member" | "admin",
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(`roles.${row.original.role || "member"}`)}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm text-[#606060]">
                {t(`roles.${row.original.role || "member"}`)}
              </span>
            )}
            {meta?.currentUser?.role === "owner" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {meta?.currentUser?.user?.id !== row.original.user?.id && (
                    <AlertDialog>
                      <DropdownMenuItem
                        className="text-destructive"
                        asDialogTrigger
                      >
                        <AlertDialogTrigger>Remove Member</AlertDialogTrigger>
                      </DropdownMenuItem>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove Team Member
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            You are about to remove the following Team Member,
                            are you sure you want to continue?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={removeMemberMutation.isPending}
                            onClick={() => {
                              removeMemberMutation.mutate({
                                memberIdOrEmail: row.original.user.email,
                              });
                            }}
                          >
                            {removeMemberMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Confirm"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {meta?.currentUser?.user?.id === row.original.user?.id && (
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
                            access at a later time, a Team Owner must invite
                            you.
                            <p className="mt-4">
                              Are you sure you want to continue?
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={leaveSpaceMutation.isPending}
                            onClick={() => leaveSpaceMutation.mutate()}
                          >
                            {leaveSpaceMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Confirm"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      );
    },
    meta: {
      className: "text-right",
    },
  },
];
