import { useAction } from "next-safe-action/hooks";

import { useConnectParams } from "~/hooks/use-connect-params";
import { updateInstitutionUsageAction } from "~/server/actions/institutions/update-institution-usage";
import { Provider } from "~/server/db/schema/open-banking";
import { GoCardLessConnect } from "./gocardless-connect";

type Props = {
  id: string;
  provider: Provider;
  availableHistory: number;
};

export function ConnectBankProvider({ id, provider, availableHistory }: Props) {
  const { setParams } = useConnectParams();
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
