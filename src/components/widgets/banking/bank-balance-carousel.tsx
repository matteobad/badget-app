"use client";

import { Account } from "~/app/old/banking/transactions/_components/transactions-table";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from "~/components/ui/carousel";
import { euroFormat } from "~/lib/utils";

export default async function BankBalanceCarousel({
  accounts,
}: {
  accounts: Account[];
}) {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="relative h-full w-full max-w-xs pt-2"
    >
      <CarouselContent>
        {accounts.map((account, index) => (
          <CarouselItem key={index} className="flex flex-col">
            <span className="text-2xl font-bold">
              {euroFormat(account.balance ?? 0)}
            </span>
            <span className="text-xs text-slate-500">{account.name}</span>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselDots className="bottom-0 left-0 justify-start" />
    </Carousel>
  );
}
