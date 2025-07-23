import type { Metadata } from "next";
import { ConnectedAccounts } from "~/components/bank-connection/connected-accounts";
import { prefetch, trpc } from "~/shared/helpers/trpc/server";

export const metadata: Metadata = {
  title: "Accounts | Badget",
};

export default async function Page() {
  prefetch(trpc.bankConnection.get.queryOptions());
  prefetch(trpc.bankAccount.get.queryOptions({ manual: true }));

  return (
    <div className="space-y-12 p-4">
      <ConnectedAccounts />
      {/* <BaseCurrency /> */}
    </div>
  );
}
