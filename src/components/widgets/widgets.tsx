"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { AccountBalance } from "./account";
import { Spending } from "./spending";
import { Transactions } from "./transactions/transactions";
import { WidgetsNavigation } from "./widgets-navigation";

export function Widgets() {
  const trpc = useTRPC();

  const { data: accounts } = useQuery(
    trpc.bankAccount.get.queryOptions({
      enabled: true,
    }),
  );

  // If the user has not connected any accounts, disable the widgets
  const disabled = !accounts?.length;

  const items = [
    <Spending disabled={disabled} key="spending" />,
    <Transactions disabled={disabled} key="transactions" />,
    <AccountBalance key="account-balance" />,
  ];

  return (
    <Carousel
      className="flex flex-col"
      opts={{
        align: "start",
        watchDrag: false,
      }}
    >
      <WidgetsNavigation />
      <div className="ml-auto hidden md:flex">
        <CarouselPrevious className="static border-none p-0 hover:bg-transparent" />
        <CarouselNext className="static border-none p-0 hover:bg-transparent" />
      </div>

      <CarouselContent className="-ml-[20px] flex-col space-y-6 md:flex-row md:space-y-0 2xl:-ml-[40px]">
        {items.map((item, idx) => {
          return (
            <CarouselItem
              className="3xl:basis-1/4 pl-[20px] lg:basis-1/2 xl:basis-1/3 2xl:pl-[40px]"
              key={idx.toString()}
            >
              {item}
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
