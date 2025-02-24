"use client";

import { EllipsisVerticalIcon, RefreshCwIcon, UnlinkIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { AccountAvatar } from "~/components/account-avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { type getAccountsForUser_CACHED } from "~/features/account/server/cached-queries";
import { formatAmount } from "~/utils/format";
import { deleteConnectionAction } from "../server/actions";
import AccountList from "./account-list";

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

  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
      {data.map((item) => {
        const total = item.accounts.reduce((acc, value) => {
          return (acc += parseFloat(value.balance));
        }, 0);

        return (
          <Card className="flex flex-col shadow-none" key={item.id}>
            <div className="flex items-center justify-between p-4">
              <AccountAvatar
                account={{
                  name: item.institution?.name ?? "",
                  logoUrl: item.institution?.logo ?? "",
                }}
              />
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  <Badge variant="secondary">
                    {item.connection?.status ?? "valido"}
                  </Badge>
                </div>
                {item.connection && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Total Balance Section */}
            <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
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
