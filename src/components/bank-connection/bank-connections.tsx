"use client";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import { StopCircleIcon, TriangleAlertIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSyncStatus } from "~/hooks/use-sync-status";
import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import {
  manualSyncTransactionsAction,
  reconnectConnectionAction,
} from "~/server/domain/bank-connection/actions";
import { connectionStatus } from "~/shared/helpers/connection-status";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { BankAccount } from "../bank-account/bank-account";
import { BankLogo } from "../bank-logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { DeleteConnection } from "./delete-connection";
import { ReconnectProvider } from "./reconnect-provider";
import { SyncTransactions } from "./sync-transactions";

function getProviderName(provider: string | null) {
  switch (provider) {
    case "gocardless":
      return "GoCardLess";
    case "enablebanking":
      return "Enable Banking";
    case "teller":
      return "Teller";
    case "plaid":
      return "Plaid";
    default:
      return null;
  }
}

type BankConnection = NonNullable<
  RouterOutput["bankConnection"]["get"]
>[number];

function ConnectionState({
  connection,
  isSyncing,
}: {
  connection: BankConnection;
  isSyncing: boolean;
}) {
  const { show, expired } = connectionStatus(connection);

  if (isSyncing) {
    return (
      <div className="text-xs font-normal flex items-center space-x-1">
        <span>Syncing...</span>
      </div>
    );
  }

  if (connection.status === "disconnected") {
    return (
      <>
        <div className="text-xs font-normal flex items-center space-x-1 text-[#c33839]">
          <TriangleAlertIcon className="size-4" />
          <span>Connection issue</span>
        </div>

        <TooltipContent
          className="px-3 py-1.5 text-xs max-w-[430px]"
          sideOffset={20}
          side="left"
        >
          Please reconnect to restore the connection to a good state.
        </TooltipContent>
      </>
    );
  }

  if (show) {
    return (
      <>
        <div className="text-xs font-normal flex items-center space-x-1 text-[#FFD02B]">
          <TriangleAlertIcon className="size-4" />
          <span>Connection expires soon</span>
        </div>

        {connection.expiresAt && (
          <TooltipContent
            className="px-3 py-1.5 text-xs max-w-[430px]"
            sideOffset={20}
            side="left"
          >
            We only have access to your bank for another{" "}
            {differenceInDays(new Date(connection.expiresAt), new Date())} days.
            Please update the connection to keep everything in sync.
          </TooltipContent>
        )}
      </>
    );
  }

  if (expired) {
    return (
      <div className="text-xs font-normal flex items-center space-x-1 text-[#c33839]">
        <StopCircleIcon className="size-4" />
        <span>Connection expired</span>
      </div>
    );
  }

  if (connection.lastAccessed) {
    return (
      <div className="text-xs font-normal flex items-center space-x-1">
        <span className="text-xs font-normal">{`Updated ${formatDistanceToNow(
          new Date(connection.lastAccessed),
          {
            addSuffix: true,
          },
        )}`}</span>
        <span>via {getProviderName(connection.provider)}</span>
      </div>
    );
  }

  return <div className="text-xs font-normal">Never accessed</div>;
}

export function BankConnection({ connection }: { connection: BankConnection }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [toastId, setToastId] = useState<string | number>();
  const [runId, setRunId] = useState<string | undefined>();
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [isSyncing, setSyncing] = useState(false);

  const { show } = connectionStatus(connection);
  const { status, setStatus } = useSyncStatus({ runId, accessToken });

  const [params] = useQueryStates({
    step: parseAsString,
    id: parseAsString,
  });

  const manualSyncTransactions = useAction(manualSyncTransactionsAction, {
    onExecute: () => setSyncing(true),
    onSuccess: ({ data }) => {
      if (data) {
        setRunId(data.id);
        setAccessToken(data.publicAccessToken);
      }
    },
    onError: () => {
      setSyncing(false);
      setRunId(undefined);
      setStatus("FAILED");

      toast.error("Something went wrong please try again.");
    },
  });

  const reconnectConnection = useAction(reconnectConnectionAction, {
    onExecute: () => setSyncing(true),
    onSuccess: ({ data }) => {
      if (data) {
        setRunId(data.id);
        setAccessToken(data.publicAccessToken);
      }
    },
    onError: () => {
      setSyncing(false);
      setRunId(undefined);
      setStatus("FAILED");

      toast.error("Something went wrong please try again.");
    },
  });

  useEffect(() => {
    if (isSyncing) {
      const id = toast.info("Syncing...", {
        description: "We're connecting to your bank, please wait.",
        duration: Number.POSITIVE_INFINITY,
      });

      setToastId(id);
    }
  }, [isSyncing, setToastId]);

  useEffect(() => {
    if (status === "COMPLETED") {
      toast.dismiss(toastId);
      setRunId(undefined);
      setSyncing(false);

      queryClient.invalidateQueries({
        queryKey: trpc.bankConnection.get.queryKey(),
      });

      queryClient.invalidateQueries({
        queryKey: trpc.bankAccount.get.queryKey(),
      });

      queryClient.invalidateQueries({
        queryKey: trpc.transaction.get.queryKey(),
      });

      queryClient.invalidateQueries({
        queryKey: trpc.transaction.get.infiniteQueryKey(),
      });
    }
  }, [status]);

  useEffect(() => {
    if (status === "FAILED") {
      setSyncing(false);
      setRunId(undefined);

      queryClient.invalidateQueries({
        queryKey: trpc.bankConnection.get.queryKey(),
      });

      queryClient.invalidateQueries({
        queryKey: trpc.bankAccount.get.queryKey(),
      });

      toast.error("Something went wrong please try again.");
    }
  }, [status]);

  // NOTE: GoCardLess reconnect flow (redirect from API route)
  useEffect(() => {
    if (params.step === "reconnect" && params.id) {
      reconnectConnection.execute({
        orgId: "placeholder", // populated on backend
        connectionId: params.id,
        provider: connection.provider,
      });
    }
  }, [params]);

  const handleManualSync = () => {
    manualSyncTransactions.execute({
      connectionId: connection.id,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <AccordionTrigger
          className="w-full justify-start text-start"
          chevronBefore
        >
          <div className="ml-4 flex w-full items-center space-x-4">
            <BankLogo src={connection.logoUrl} alt={connection.name} />

            <div className="flex flex-col">
              <span className="text-sm">{connection.name}</span>

              <TooltipProvider delayDuration={70}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ConnectionState
                        connection={connection}
                        isSyncing={isSyncing}
                      />
                    </div>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </AccordionTrigger>

        <div className="ml-auto flex items-center space-x-2">
          {connection.status === "disconnected" || show ? (
            <>
              <ReconnectProvider
                variant="button"
                id={connection.id}
                provider={connection.provider}
                institutionId={connection.institutionId}
              />
              <DeleteConnection connectionId={connection.id} />
            </>
          ) : (
            <>
              <ReconnectProvider
                id={connection.id}
                provider={connection.provider}
                institutionId={connection.institutionId}
              />
              <SyncTransactions
                disabled={isSyncing}
                onClick={handleManualSync}
              />
              <DeleteConnection connectionId={connection.id} />
            </>
          )}
        </div>
      </div>

      <AccordionContent className="bg-background">
        <div className="ml-[30px] divide-y">
          {connection.bankAccounts.map((account) => {
            return <BankAccount key={account.id} data={account} />;
          })}
        </div>
      </AccordionContent>
    </div>
  );
}

export function BankConnections() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.bankConnection.get.queryOptions());
  const defaultValue = data?.length === 1 ? ["connection-0"] : undefined;

  return (
    <div className="divide-y px-6">
      <Accordion type="multiple" className="w-full" defaultValue={defaultValue}>
        {data?.map((connection, index) => {
          return (
            <AccordionItem
              value={`connection-${index}`}
              key={connection.id}
              className="border-none"
            >
              <BankConnection connection={connection} />
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
