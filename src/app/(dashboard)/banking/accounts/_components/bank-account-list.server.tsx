import { Skeleton } from "~/components/ui/skeleton";
import { getUserBankAccounts } from "~/server/db/queries/cached-queries";
import { AddBankAccountButton } from "./add-bank-account-button";

// import { BankConnections } from "./bank-connections";
// import { ManualAccounts } from "./manual-accounts";

export function BankAccountListLoading() {
  return (
    <div className="space-y-6 divide-y px-6 pb-6">
      <div className="flex items-center justify-between">
        <div className="ml-[30px] divide-y">
          <div className="mb-4 flex items-center justify-between pt-4">
            <div className="flex items-center">
              <Skeleton className="flex h-9 w-9 items-center justify-center space-y-0 rounded-full" />
              <div className="ml-4 flex flex-col">
                <p className="mb-1 text-sm font-medium leading-none">
                  <Skeleton className="h-3 w-[200px] rounded-none" />
                </p>
                <span className="text-xs font-medium text-[#606060]">
                  <Skeleton className="mt-1 h-2.5 w-[100px] rounded-none" />
                </span>
              </div>
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between pt-4">
            <div className="flex items-center">
              <Skeleton className="flex h-9 w-9 items-center justify-center space-y-0 rounded-full" />
              <div className="ml-4 flex flex-col">
                <p className="mb-1 text-sm font-medium leading-none">
                  <Skeleton className="h-3 w-[200px] rounded-none" />
                </p>
                <span className="text-xs font-medium text-[#606060]">
                  <Skeleton className="mt-1 h-2.5 w-[100px] rounded-none" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type BankAccount = Awaited<
  ReturnType<typeof getUserBankAccounts>
>[number]["bank_accounts"];

export async function BankAccountList() {
  const data = await getUserBankAccounts();

  // const manualAccounts = data.filter((item) => item.bank_accounts.manual);

  const bankMap: Record<string, { accounts: BankAccount[] }> = {};

  for (const item of data) {
    const institutionId = item.instituions?.id;

    if (!institutionId) {
      continue;
    }

    if (!bankMap[institutionId]) {
      // If the bank is not in the map, add it
      bankMap[institutionId] = {
        ...item.bank_accounts,
        accounts: [],
      };
    }

    // Add the account to the bank's accounts array
    bankMap[institutionId].accounts.push(item.bank_accounts);
  }

  // Convert the map to an array
  const result = Object.values(bankMap);

  function sortAccountsByEnabled(accounts: BankAccount[]) {
    return accounts.sort((a, b) =>
      a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1,
    );
  }

  // Sort the accounts within each bank in the result array
  for (const bank of result) {
    if (Array.isArray(bank.accounts)) {
      bank.accounts = sortAccountsByEnabled(bank.accounts);
    }
  }

  if (result.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-2xl font-bold tracking-tight">Nessun Conto</h3>
          <p className="text-sm text-muted-foreground">
            Cominciamo aggiungendo il tuo primo conto corrente.
          </p>
        </div>
        <AddBankAccountButton />
      </div>
    );
  }

  return (
    <>
      {/* <BankConnections data={result} />
      <ManualAccounts data={manualAccounts} /> */}
    </>
  );
}
