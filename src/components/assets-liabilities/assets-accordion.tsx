"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { ACCOUNT_SUBTYPE } from "~/shared/constants/enum";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { DataTable } from "../bank-account/table/data-table";
import { NoAccounts } from "../bank-account/table/empty-states";
import { Loading } from "../bank-account/table/loading";

export function AssetsAccordion() {
  const trpc = useTRPC();

  const { data, isSuccess } = useQuery(trpc.asset.get.queryOptions());

  if (!data?.length && isSuccess) {
    return (
      <div className="absolute inset-0 h-screen overflow-hidden p-6">
        <NoAccounts />
        <Loading isEmpty />
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      className="w-full space-y-2"
      defaultValue={["checking"]}
    >
      {Object.values(ACCOUNT_SUBTYPE).map((item) => {
        const accounts = data?.filter(({ subtype }) => item === subtype);

        if (!accounts?.length) return;

        return (
          <AccordionItem
            value={item}
            key={item}
            className="rounded-md border bg-background p-0 outline-none last:border-b has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
          >
            <AccordionTrigger className="h-10 px-4 text-[15px] leading-6 hover:no-underline focus-visible:ring-0">
              {item}
            </AccordionTrigger>
            <AccordionContent className="p-0 text-muted-foreground">
              <DataTable />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
