import BankLogo from "~/components/bank-logo";
import { ConnectBankProvider } from "~/components/connect-bank-provider";
import { InstitutionInfo } from "~/components/institution-info";
import { getFilteredInstitutions } from "~/server/db/queries/cached-queries";

export async function InstitutionListServer({ query }: { query: string }) {
  const institutions = await getFilteredInstitutions({ q: query });

  return (
    <ul className="flex-1 space-y-1 overflow-auto">
      {institutions.map((institution) => {
        return (
          <li key={institution.id}>
            <div className="flex justify-between">
              <div className="flex items-center gap-4">
                <BankLogo
                  src={institution.logo}
                  alt={institution.name + " logo"}
                />

                <div className="flex flex-col justify-center space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {institution.name}
                  </p>
                  <InstitutionInfo provider={institution.provider}>
                    <span className="text-xs capitalize text-[#878787]">
                      Via {institution.provider}
                    </span>
                  </InstitutionInfo>
                </div>
              </div>

              <div className="opacity-0 transition-opacity hover:opacity-100">
                <ConnectBankProvider
                  id={institution.id}
                  provider={institution.provider}
                  availableHistory={institution.availableHistory ?? 0}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
