import type { Metadata } from "next";
import { AssetsAccordion } from "~/components/assets-liabilities/assets-accordion";
import { MainActions } from "~/components/assets-liabilities/main-actions";
import { AccountsSearchFilter } from "~/components/bank-account/accounts-search-filter";
import { HydrateClient } from "~/shared/helpers/trpc/server";

export const metadata: Metadata = {
  title: "Accounts | Badget.",
};

export default async function AccountsPage() {
  // const queryClient = getQueryClient();

  // Fetch account preferences directly for initial data (no prefetch needed)
  // const accountPreferences = await queryClient.fetchQuery(
  //   trpc.bankAccount.getAccountPreferences.queryOptions(),
  // );

  return (
    <HydrateClient>
      <div className="flex flex-col gap-4 py-6">
        <div className="flex items-center justify-between">
          <AccountsSearchFilter />
          <MainActions />
        </div>

        <AssetsAccordion />
      </div>
    </HydrateClient>
  );
}
