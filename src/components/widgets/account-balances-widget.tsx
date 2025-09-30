import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { LandmarkIcon } from "lucide-react";

import { BaseWidget } from "./base";

export function AccountBalancesWidget() {
  const tScoped = useScopedI18n("widgets.account-balances");

  const trpc = useTRPC();
  const router = useRouter();

  const { data: space } = useSpaceQuery();

  // Fetch combined account balances
  const { data } = useQuery({
    ...trpc.widgets.getAccountBalances.queryOptions({
      currency: space?.baseCurrency ?? "EUR",
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const balanceData = data?.result;
  const totalBalance = balanceData?.totalBalance ?? 0;
  const currency = balanceData?.currency ?? space?.baseCurrency ?? "EUR";
  const accountCount = balanceData?.accountCount ?? 0;

  const handleClick = () => {
    router.push("/accounts");
  };

  // const getAccountTypeBreakdown = () => {
  //   if (!balanceData?.accountBreakdown) return null;

  //   // Group accounts by type and calculate totals
  //   const typeBreakdown = balanceData.accountBreakdown.reduce(
  //     (acc, account) => {
  //       const type = account.type;
  //       if (!acc[type]) {
  //         acc[type] = { count: 0, balance: 0 };
  //       }
  //       acc[type].count += 1;
  //       acc[type].balance += account.convertedBalance;
  //       return acc;
  //     },
  //     {} as Record<string, { count: number; balance: number }>,
  //   );

  //   // Get the primary account type (highest balance)
  //   const primaryType = Object.entries(typeBreakdown).sort(
  //     ([, a], [, b]) => b.balance - a.balance,
  //   )[0];

  //   if (!primaryType) return null;

  //   const [type, data] = primaryType;
  //   const typeLabel = type === "depository" ? "checking/savings" : type;

  //   if (data.count === 1) {
  //     return `${typeLabel} account`;
  //   }

  //   return `${data.count} ${typeLabel} accounts`;
  // };

  return (
    <BaseWidget
      title={tScoped("title")}
      icon={<LandmarkIcon className="size-4" />}
      description={tScoped("description", { count: accountCount })}
      onClick={handleClick}
      actions={tScoped("action")}
    >
      <div className="flex flex-1 items-end gap-2">
        <span className="text-2xl">
          {formatAmount({
            currency,
            amount: totalBalance,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </span>
      </div>
    </BaseWidget>
  );
}
