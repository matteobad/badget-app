import { getPensionAccountsByUserId } from "~/lib/data";
import { SelectFacets } from "./select-facets";

export async function BaseFacetsServer() {
  const pensionAccounts = await getPensionAccountsByUserId();
  const defaultAccounts = pensionAccounts.map((pa) => pa.id);
  const dateOptions = [new Date()];

  return (
    <SelectFacets
      accountOptions={pensionAccounts}
      defaultAccounts={defaultAccounts}
      dateOptions={dateOptions}
      defaultDate={dateOptions[0]!}
    />
  );
}
