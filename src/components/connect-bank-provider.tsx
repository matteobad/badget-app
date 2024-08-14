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

  const updateUsage = () => {
    updateInstitutionUsage.execute({ institutionId: id });
  };

  switch (provider) {
    case Provider.GOCARDLESS: {
      return (
        <GoCardLessConnect
          id={id}
          availableHistory={availableHistory}
          onSelect={() => {
            updateUsage();
          }}
        />
      );
    }
    default:
      return null;
  }
}
