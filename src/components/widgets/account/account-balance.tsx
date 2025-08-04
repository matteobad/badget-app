"use client";

import { useState } from "react";
import Image from "next/image";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FormatAmount } from "~/components/format-amount";
import { cn } from "~/lib/utils";
import { formatAccountName } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { LandmarkIcon } from "lucide-react";

export function AccountBalance() {
  const [activeIndex, setActiveIndex] = useState(0);
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.bankAccount.get.queryOptions({ enabled: true }),
  );

  const formattedData = data.sort((a, b) => b.balance - a.balance);
  const activeAccount = formattedData?.at(activeIndex);

  if (!activeAccount) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <LandmarkIcon className="text-muted-foreground" />
        <p className="w-[50%] text-center text-sm text-[#606060]">
          No accounts have been connected or created.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 flex flex-col items-center justify-between space-y-6">
      <div className="-mt-6 flex aspect-square w-[80%] flex-col items-center justify-center space-y-2 rounded-full bg-[#F2F1EF] p-8 md:w-[75%] lg:w-[85%] 2xl:w-[80%] dark:bg-secondary">
        <h2 className="font-mono text-2xl font-medium">
          <FormatAmount
            amount={activeAccount.balance}
            currency={activeAccount.currency}
          />
        </h2>

        <div className="flex items-center space-x-2">
          {activeAccount?.logoUrl && (
            <Image
              src={activeAccount.logoUrl}
              alt=""
              width={24}
              height={24}
              quality={100}
              className="aspect-square rounded-full border"
            />
          )}

          <span className="text-xs font-medium text-[#606060]">
            {formatAccountName({
              name: activeAccount.name,
              currency: activeAccount.currency,
            })}
          </span>
        </div>
      </div>

      {formattedData?.length && formattedData.length > 1 && (
        <div className="flex space-x-2">
          {formattedData.map((account, idx) => (
            <button
              type="button"
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => setActiveIndex(idx)}
              key={account.id}
              className={cn(
                "h-[8px] w-[8px] cursor-pointer rounded-full bg-[#1D1D1D] opacity-30 transition-all dark:bg-[#D9D9D9]",
                idx === activeIndex && "opacity-1",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
