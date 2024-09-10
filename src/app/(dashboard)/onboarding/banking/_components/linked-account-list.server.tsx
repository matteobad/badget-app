import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { euroFormat } from "~/lib/utils";
import { getAccounts } from "~/server/actions/institutions/get-accounts";

export async function LinkedAccountListServer({
  reference,
}: {
  reference?: string | string[];
}) {
  const accounts: Awaited<ReturnType<typeof getAccounts>> = [];

  const refs = Array.isArray(reference)
    ? reference
    : reference
      ? [reference]
      : [];

  for (const id of refs) {
    const data = await getAccounts({ id });
    accounts.push(...data);
  }

  return (
    <ul className="grid w-full grid-cols-1 gap-1">
      {accounts.map((account) => (
        <li key={account.id} className="flex items-center">
          <div className="flex h-12 w-full items-center justify-start gap-2 rounded-none text-left text-sm font-normal hover:bg-muted">
            <Avatar className="h-8 w-8 rounded-none">
              <AvatarImage src={account.institution.logo ?? ""} />
              <AvatarFallback>{account.institution.name}</AvatarFallback>
            </Avatar>
            <span className="w-[80%] truncate">
              {account.account.name ??
                account.account.displayName ??
                account.institution.name}
            </span>
            <span className="flex-1"></span>
            <span>{euroFormat(account.balance?.amount ?? 0)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
