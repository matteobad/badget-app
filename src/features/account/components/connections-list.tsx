"use client";

import React from "react";
import {
  EllipsisVerticalIcon,
  RefreshCwIcon,
  UnlinkIcon,
  Wallet2Icon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { InstitutionInfo } from "~/components/institution-info";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import {
  connectGocardlessAction,
  deleteConnectionAction,
} from "../server/actions";
import { type getConnectionsForUser_CACHED } from "../server/cached-queries";
import ConnectionStatusBadge from "./connection-status-badge";

export default function ConnectionsList({
  className,
  connections,
}: {
  connections: Awaited<ReturnType<typeof getConnectionsForUser_CACHED>>;
} & React.ComponentProps<"ul">) {
  const connectAction = useAction(connectGocardlessAction, {
    onError: ({ error }) => toast.error(error.serverError),
    onSuccess: () => toast.success("Connessione iniziata!"),
  });

  const deleteAction = useAction(deleteConnectionAction, {
    onError: ({ error }) => toast.error(error.serverError),
    onSuccess: () => toast.success("Connessione iniziata!"),
  });

  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {connections.map((connection) => {
        return (
          <li key={connection.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={connection.institution?.logo ?? ""}
                    alt={`${connection.institution?.name} logo`}
                  ></AvatarImage>
                  <AvatarFallback>
                    <Wallet2Icon className="size-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="">
                    {connection.institution?.name ?? "Manuale"}
                  </span>
                  <InstitutionInfo provider={connection.provider}>
                    <span className="text-xs text-muted-foreground">
                      {connection.provider}
                    </span>
                  </InstitutionInfo>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ConnectionStatusBadge status={connection.status!} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      disabled={connectAction.isExecuting}
                      onClick={() => {
                        connectAction.execute({
                          institutionId: connection.institutionId,
                          provider: connection.provider,
                          redirectBase: window.location.origin,
                        });
                      }}
                    >
                      <RefreshCwIcon className="size-3" />
                      Rinnova connessione
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      disabled={deleteAction.isExecuting}
                      onClick={() => {
                        deleteAction.execute({
                          id: connection.id,
                          provider: connection.provider,
                        });
                      }}
                    >
                      <UnlinkIcon className="size-3" />
                      Revoca connessione
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
