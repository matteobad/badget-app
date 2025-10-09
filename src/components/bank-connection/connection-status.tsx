"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageCircleWarningIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { getConnectionsStatus } from "~/shared/helpers/connection-status";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function ConnectionStatus() {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.bankConnection.get.queryOptions({
      enabled: true,
    }),
  );

  if (isLoading || !data) {
    return null;
  }

  const connectionIssue = data?.some((bank) => bank.status === "disconnected");

  if (connectionIssue) {
    return (
      <TooltipProvider delayDuration={70}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/settings/accounts" prefetch>
              <Button
                variant="outline"
                size="icon"
                className="hidden h-8 w-8 items-center rounded-full md:flex"
              >
                <MessageCircleWarningIcon
                  size={16}
                  className="text-[#FF3638]"
                />
              </Button>
            </Link>
          </TooltipTrigger>

          <TooltipContent
            className="max-w-[230px] px-3 py-1.5 text-xs"
            sideOffset={10}
          >
            There is a connection issue with one of your banks.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // NOTE: No connections with expire_at (Only GoCardLess and Enable Banking)
  if (data?.find((bank) => bank.expiresAt === null)) {
    return null;
  }

  const { warning, error, show } = getConnectionsStatus(data);

  if (!show) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={70}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/settings/accounts" prefetch>
            <Button
              variant="outline"
              size="icon"
              className="hidden h-8 w-8 items-center rounded-full md:flex"
            >
              <MessageCircleWarningIcon
                size={16}
                className={cn(
                  error && "text-[#FF3638]",
                  warning && "text-[#FFD02B]",
                )}
              />
            </Button>
          </Link>
        </TooltipTrigger>

        <TooltipContent
          className="max-w-[230px] px-3 py-1.5 text-xs"
          sideOffset={10}
        >
          The connection is expiring soon, update your connection.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
