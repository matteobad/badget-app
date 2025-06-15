"use client";

import type { AccountType } from "~/server/db/schema/enum";
import { use } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Card } from "~/components/ui/card";
import { type getAccountsForUser_CACHED } from "~/features/account/server/cached-queries";
import { useScopedI18n } from "~/shared/locales/client";
import { formatAmount } from "~/utils/format";

import AccountIcon from "./account-icon";
import AccountList from "./account-list";

export default function AccountCardGrid({
  promises,
}: {
  promises: Promise<[Awaited<ReturnType<typeof getAccountsForUser_CACHED>>]>;
}) {
  const [accounts] = use(promises);

  const tScoped = useScopedI18n("account.type");

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-4">
      {Object.entries(accounts).map(([key, value]) => {
        const total = value.reduce((acc, item) => {
          return (acc += parseFloat(item.balance));
        }, 0);

        return (
          <Card className="col-span-2 flex flex-col shadow-none" key={key}>
            <div className="flex items-center justify-between p-4 pb-0">
              <span className="text-muted-foreground">
                {tScoped(key as AccountType)}
              </span>
              <AccountIcon type={key as AccountType} />
            </div>

            {/* Total Balance Section */}
            <div className="flex items-center justify-between border-b border-zinc-100 p-4 pt-2 dark:border-zinc-800">
              <div className="">
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatAmount({ amount: total })}
                </h1>
                <p className="text-xs text-muted-foreground">Saldo totale</p>
              </div>
            </div>

            {/* Accounts List */}
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="px-4">
                  Carte e conti
                </AccordionTrigger>
                <AccordionContent>
                  <AccountList accounts={value} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        );
      })}
    </div>
  );
}
