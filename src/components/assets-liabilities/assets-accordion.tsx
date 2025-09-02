"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { useBankAccountFilterParams } from "~/hooks/use-bank-account-filter-params";
import { ACCOUNT_SUBTYPE } from "~/shared/constants/enum";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";

import { DataTable } from "../bank-account/table/data-table";
import { NoAccounts, NoResults } from "../bank-account/table/empty-states";
import { Loading } from "../bank-account/table/loading";

export function AssetsAccordion() {
  const tScoped = useScopedI18n("account.subtype");

  const { filters, hasFilters } = useBankAccountFilterParams();

  const trpc = useTRPC();

  const { data, isSuccess } = useQuery(
    trpc.asset.get.queryOptions({
      q: filters.q,
    }),
  );

  if (!data?.length && isSuccess && !hasFilters) {
    return (
      <div className="absolute inset-0 h-screen overflow-hidden p-6">
        <NoAccounts />
        <Loading isEmpty />
      </div>
    );
  }

  if (!data?.length && isSuccess && hasFilters) {
    return (
      <div className="relative h-[300px] overflow-hidden p-6">
        <NoResults />
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      className="w-full space-y-4"
      defaultValue={["checking", "savings"]}
    >
      {Object.values(ACCOUNT_SUBTYPE).map((accountSubtype) => {
        const accounts = data?.filter(
          ({ subtype }) => accountSubtype === subtype,
        );

        const total =
          accounts?.reduce((tot, value) => (tot += value.balance), 0) ?? 0;

        if (!accounts?.length) return;

        return (
          <AccordionItem
            value={accountSubtype}
            key={accountSubtype}
            className="rounded-md border bg-background p-0 outline-none last:border-b has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
          >
            <AccordionTrigger className="flex h-10 px-4 text-sm leading-6 hover:no-underline focus-visible:ring-0">
              <span className="shrink-0">{tScoped(accountSubtype)}</span>
              <div className="mr-[84px] w-full text-right">
                {formatAmount({ amount: total, currency: "EUR" })}
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0 text-muted-foreground">
              <DataTable data={accounts} />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
