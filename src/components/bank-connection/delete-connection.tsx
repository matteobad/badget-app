"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { DeleteIcon, Loader2 } from "lucide-react";

type Props = {
  connectionId: string;
};

export function DeleteConnection({ connectionId }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const deleteConnectionMutation = useMutation(
    trpc.bankConnection.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.bankConnection.get.queryKey(),
        });

        setOpen(false);
        setValue("");
      },
    }),
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={70}>
        <Tooltip>
          <AlertDialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="flex h-7 w-7 items-center rounded-full"
                disabled={deleteConnectionMutation.isPending}
              >
                <DeleteIcon size={16} />
              </Button>
            </TooltipTrigger>
          </AlertDialogTrigger>

          <TooltipContent className="px-3 py-1.5 text-xs" sideOffset={10}>
            Delete
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Connection</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete a bank connection. If you proceed, all
            transactions associated with this connection and all bank accounts
            will also be deleted.
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
            disabled={value !== "DELETE" || deleteConnectionMutation.isPending}
            onClick={() =>
              deleteConnectionMutation.mutate({ id: connectionId })
            }
          >
            {deleteConnectionMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Confirm"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
