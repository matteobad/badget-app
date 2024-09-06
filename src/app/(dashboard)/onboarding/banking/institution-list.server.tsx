import { ConnectBankProvider } from "~/components/connect-bank-provider";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getFilteredInstitutions } from "~/server/db/queries/cached-queries";

export async function InstitutionListServer({
  country,
  q,
}: {
  country: string;
  q: string;
}) {
  const institutions = await getFilteredInstitutions({ country, q });

  return (
    <ul className="-mr-4 grid grid-cols-1 gap-1">
      {institutions.map((institution) => (
        <li key={institution.id} className="flex items-center">
          <ConnectBankProvider
            provider={institution.provider}
            id={institution.id}
            availableHistory={institution.availableHistory ?? 90}
          >
            <div className="flex h-12 w-full items-center justify-start gap-2 rounded-none pl-4 text-left text-sm font-normal hover:bg-muted">
              <Avatar className="h-8 w-8 rounded-none">
                <AvatarImage src={institution.logo ?? ""} />
                <AvatarFallback>{institution.name}</AvatarFallback>
              </Avatar>
              <span className="w-[80%] truncate">{institution.name}</span>
            </div>
          </ConnectBankProvider>
        </li>
      ))}
    </ul>
  );
}
