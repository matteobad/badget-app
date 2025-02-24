"use client";

import { ArrowUpRight, CreditCard, QrCode, Wallet } from "lucide-react";
import { useQueryStates } from "nuqs";

import { AccountAvatar } from "~/components/account-avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { type getAccountsForUser_CACHED } from "~/features/account/server/cached-queries";
import { cn } from "~/lib/utils";
import { formatAmount } from "~/utils/format";
import { connectionsParsers } from "../../open-banking/utils/search-params";

type GroupedAccount = Awaited<
  ReturnType<typeof getAccountsForUser_CACHED>
>[number];

export default function AccountCardGrid({ data }: { data: GroupedAccount[] }) {
  const [, setParams] = useQueryStates(connectionsParsers);

  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
      {data.map((item) => {
        const total = item.accounts.reduce((acc, value) => {
          return (acc += parseFloat(value.balance));
        }, 0);

        return (
          <Card className="flex flex-col shadow-none" key={item.id}>
            <div className="flex justify-between p-4">
              <AccountAvatar
                account={{
                  name: item.institution?.name ?? "",
                  logoUrl: item.institution?.logo ?? "",
                }}
              />
              <div className="text-sm text-muted-foreground">
                <Badge variant="secondary">
                  {item.connection?.status ?? "valido"}
                </Badge>
              </div>
            </div>

            {/* Total Balance Section */}
            <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
              <p className="text-xs text-muted-foreground">Saldo totale</p>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatAmount({ amount: total })}
              </h1>
            </div>

            {/* Accounts List */}
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="px-4">
                  Carte e conti
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-2 py-0">
                    {item.accounts.map((account) => (
                      <div
                        key={account.id}
                        className={cn(
                          "group flex items-center justify-between",
                          "rounded-lg p-2",
                          "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                          "transition-all duration-200",
                        )}
                        onClick={() => setParams({ id: account.id })}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn("rounded-lg p-1.5", {
                              "bg-emerald-100 dark:bg-emerald-900/30":
                                account.type === "savings",
                              "bg-blue-100 dark:bg-blue-900/30":
                                account.type === "checking",
                              "bg-purple-100 dark:bg-purple-900/30":
                                account.type === "investment",
                            })}
                          >
                            {account.type === "savings" && (
                              <Wallet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            )}
                            {account.type === "checking" && (
                              <QrCode className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            )}
                            {account.type === "investment" && (
                              <ArrowUpRight className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                            )}
                            {account.type === "debt" && (
                              <CreditCard className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="">{account.name}</h3>
                            {account.description && (
                              <p className="text-xs text-muted-foreground">
                                {account.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-medium">
                            {formatAmount({
                              amount: parseFloat(account.balance),
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        );
      })}
    </div>
  );
}
