import type { Metadata } from "next";
import { ConnectedAccounts } from "~/components/bank-connection/connected-accounts";
import { prefetch, trpc } from "~/shared/helpers/trpc/server";

export const metadata: Metadata = {
  title: "Bank connections | Badget",
};

export default async function Page() {
  prefetch(trpc.bankConnection.get.queryOptions());

  return (
    <div className="space-y-12">
      <ConnectedAccounts />
      {/* <BaseCurrency /> */}
    </div>
  );
}
