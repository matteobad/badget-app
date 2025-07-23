"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "~/lib/utils";
import { getInitials } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { Loader2, MoreHorizontal } from "lucide-react";
import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";

import { FormatAmount } from "../format-amount";
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
} from "../ui/alert-dialog";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { UpdateBankAccountDialog } from "./update-bank-account-dialog";

type Props = {
  data: NonNullable<
    RouterOutput["bankConnection"]["get"]
  >[number]["bankAccounts"][number];
};

export function BankAccount({ data }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");
  const [isOpen, setOpen] = useState(false);

  const [, setParams] = useQueryStates({
    step: parseAsString,
    accountId: parseAsString,
    hide: parseAsBoolean,
    type: parseAsString,
  });

  const { id, enabled, manual, type, name, balance, currency } = data;

  const deleteAccountMutation = useMutation(
    trpc.bankAccount.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.get.queryKey(),
        });

        void queryClient.invalidateQueries({
          queryKey: trpc.bankConnection.get.queryKey(),
        });

        setOpen(false);
      },
    }),
  );

  const updateAccountMutation = useMutation(
    trpc.bankAccount.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.get.queryKey(),
        });

        void queryClient.invalidateQueries({
          queryKey: trpc.bankConnection.get.queryKey(),
        });
      },
    }),
  );

  return (
    <div
      className={cn(
        "flex items-center justify-between py-4",
        !enabled && "opacity-60",
      )}
    >
      <div className="mr-8 flex w-full items-center space-x-4">
        <Avatar className="size-[34px]">
          <AvatarFallback className="text-[11px]">
            {getInitials(name ?? "")}
          </AvatarFallback>
        </Avatar>

        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col">
            <p className="mb-1 text-sm leading-none font-medium">{name}</p>
          </div>

          {balance && currency ? (
            <span className="text-sm text-[#878787]">
              <FormatAmount amount={balance} currency={currency} />
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MoreHorizontal size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem onClick={() => setOpen(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  void setParams({
                    step: "import",
                    accountId: id,
                    type,
                    hide: true,
                  });
                }}
              >
                Import
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <AlertDialogTrigger className="w-full text-left">
                  Remove
                </AlertDialogTrigger>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to delete a bank account. If you proceed, all
                transactions associated with this account will also be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="mt-2 flex flex-col gap-2">
              <Label htmlFor="confirm-delete">
                Type <span className="font-medium">DELETE</span> to confirm.
              </Label>
              <Input
                id="confirm-delete"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={value !== "DELETE"}
                onClick={() => deleteAccountMutation.mutate({ id })}
              >
                {deleteAccountMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!manual && (
          <Switch
            checked={enabled}
            disabled={updateAccountMutation.isPending}
            onCheckedChange={(enabled: boolean) => {
              updateAccountMutation.mutate({ id, enabled });
            }}
          />
        )}
      </div>

      <UpdateBankAccountDialog
        id={id}
        onOpenChange={setOpen}
        isOpen={isOpen}
        defaultName={name}
        defaultType={type}
        defaultBalance={balance}
      />
    </div>
  );
}
