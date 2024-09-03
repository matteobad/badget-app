import { Suspense } from "react";

import { type Provider } from "~/server/db/schema/enum";
import { AccountListLoading } from "./account-list.loading";
import { AccountListServer } from "./account-list.server";

export function AccountStep({
  reference,
  provider,
}: {
  reference: string;
  provider: Provider;
}) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col items-start gap-1">
        <h2 className="text-xl font-semibold">Select Accounts</h2>
        <p className="text-sm text-slate-500">
          Select the accounts to receive transactions. You can enable or disable
          them later in settings if needed. Note: Initial loading may take some
          time.
        </p>
      </header>
      <div className="flex h-[320px] flex-col gap-6">
        <Suspense key={reference} fallback={<AccountListLoading />}>
          <AccountListServer reference={reference} provider={provider} />
        </Suspense>
      </div>
    </section>
  );
}
