import { getAccounts } from "~/server/actions/institutions/get-accounts";
import { type Provider } from "~/server/db/schema/enum";
import { SelectAccountsForm } from "./select-accounts-form";

export async function AccountListServer({
  reference,
  provider,
}: {
  reference: string;
  provider: Provider;
}) {
  const accounts = await getAccounts({ id: reference });

  return (
    <SelectAccountsForm
      accounts={accounts}
      provider={provider}
      reference={reference}
    />
  );
}
