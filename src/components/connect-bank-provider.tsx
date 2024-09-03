"use client";

import { useAction } from "next-safe-action/hooks";

import { updateInstitutionUsageAction } from "~/server/actions/institutions/update-institution-usage";
import { Provider } from "~/server/db/schema/enum";
import { GoCardLessConnect } from "./gocardless-connect";

export function ConnectBankProvider({
  id,
  provider,
  availableHistory,
}: {
  id: string;
  provider: Provider;
  availableHistory: number;
}) {
  const updateInstitutionUsage = useAction(updateInstitutionUsageAction);

  switch (provider) {
    case Provider.GOCARDLESS: {
      return (
        <GoCardLessConnect
          id={id}
          availableHistory={availableHistory}
          onSelect={() => {
            updateInstitutionUsage.execute({ institutionId: id });
          }}
        />
      );
    }
    default:
      return null;
  }
}
