"use client";

import {
  EllipsisVerticalIcon,
  ReceiptIcon,
  RefreshCwIcon,
  UnlinkIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { AccountAvatar } from "~/components/account-avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { type getAccountsForUser_CACHED } from "~/features/account/server/cached-queries";
import { CONNECTION_STATUS } from "~/server/db/schema/enum";
import { formatAmount } from "~/utils/format";
import { deleteConnectionAction } from "../server/actions";
import AccountIcon from "./account-icon";
import AccountList from "./account-list";
import ConnectionStatusBadge from "./connection-status-badge";

type GroupedAccount = Awaited<
  ReturnType<typeof getAccountsForUser_CACHED>
>[number];

export default function AccountCardGrid({ data }: { data: GroupedAccount[] }) {
  const { execute, isExecuting } = useAction(deleteConnectionAction, {
    onError: ({ error }) => {
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      toast.success(data?.message);
    },
  });

  const totalSavings = data.reduce((acc, value) => {
    acc += value.accounts.reduce((tot, account) => {
      tot += account.type === "savings" ? parseFloat(account.balance) : 0;
      return tot;
    }, 0);
    return acc;
  }, 0);
  const totalChecking = data.reduce((acc, value) => {
    acc += value.accounts.reduce((tot, account) => {
      tot += account.type === "checking" ? parseFloat(account.balance) : 0;
      return tot;
    }, 0);
    return acc;
  }, 0);
  const totalInvestment = data.reduce((acc, value) => {
    acc += value.accounts.reduce((tot, account) => {
      tot += account.type === "investment" ? parseFloat(account.balance) : 0;
      return tot;
    }, 0);
    return acc;
  }, 0);

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-4">
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Totale</CardTitle>
          <AccountIcon type="other" size="sm" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatAmount({
              amount: totalChecking + totalSavings + totalInvestment,
            })}
          </div>
          <p className="text-xs text-muted-foreground">4 conti totali</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Totale liquido</CardTitle>
          <AccountIcon type="checking" size="sm" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatAmount({
              amount: totalChecking,
            })}
          </div>
          <p className="text-xs text-muted-foreground">2 conti correnti</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Totale risparmi</CardTitle>
          <AccountIcon type="savings" size="sm" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatAmount({
              amount: totalSavings,
            })}
          </div>
          <p className="text-xs text-muted-foreground">2 conti deposito</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Totale investimenti
          </CardTitle>
          <AccountIcon type="investment" size="sm" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatAmount({
              amount: totalInvestment,
            })}
          </div>
          <p className="text-xs text-muted-foreground">Nessun investimento</p>
        </CardContent>
      </Card>

      {data.map((item) => {
        const total = item.accounts.reduce((acc, value) => {
          return (acc += parseFloat(value.balance));
        }, 0);

        return (
          <Card className="col-span-2 flex flex-col shadow-none" key={item.id}>
            <div className="flex items-center justify-between p-4">
              <AccountAvatar
                account={{
                  name: item.institution?.name ?? "",
                  logoUrl: item.institution?.logo ?? "",
                }}
              />
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  <ConnectionStatusBadge
                    status={
                      item.connection?.status ?? CONNECTION_STATUS.UNKNOWN
                    }
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>
                      <ReceiptIcon className="size-3" />
                      Vedi transazioni
                    </DropdownMenuItem>
                    {item.connection && (
                      <>
                        <DropdownMenuItem disabled>
                          <RefreshCwIcon className="size-3" />
                          Rinnova connessione
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={isExecuting}
                          onClick={() => {
                            execute({
                              id: item.connection!.id,
                              provider: item.connection!.provider,
                            });
                          }}
                        >
                          <UnlinkIcon className="size-3" />
                          Revoca connessione
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Total Balance Section */}
            <div className="flex items-center justify-between border-b border-zinc-100 p-4 pt-2 dark:border-zinc-800">
              <div className="">
                <p className="text-xs text-muted-foreground">Saldo totale</p>
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatAmount({ amount: total })}
                </h1>
              </div>
            </div>

            {/* Accounts List */}
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="px-4">
                  Carte e conti
                </AccordionTrigger>
                <AccordionContent>
                  <AccountList accounts={item.accounts} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        );
      })}
    </div>
  );
}
