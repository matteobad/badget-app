import Image from "next/image";

import { ConnectBankProvider } from "~/components/connect-bank-provider";
import { InstitutionInfo } from "~/components/institution-info";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { getFilteredInstitutions } from "~/server/db/queries/cached-queries";

function InstitutionFeaturedList({
  institutions,
}: {
  institutions: Awaited<ReturnType<typeof getFilteredInstitutions>>;
}) {
  return (
    <ul className="grid grid-cols-2 gap-4">
      {institutions.map((institution) => {
        return (
          <li key={institution.id}>
            <ConnectBankProvider
              id={institution.id}
              provider={institution.provider}
              availableHistory={institution.availableHistory ?? 0}
            >
              <div className="flex h-full flex-col items-center justify-evenly gap-4 rounded border p-6 hover:bg-slate-50">
                <Image
                  src={
                    institution.logo ??
                    "https://cdn-engine.midday.ai/default.jpg"
                  }
                  alt={institution.name + " logo"}
                  width={40}
                  height={40}
                />

                <p className="text-center text-sm font-medium leading-none">
                  {institution.name}
                </p>
                {/* <InstitutionInfo provider={institution.provider}>
                    <span className="text-xs capitalize text-slate-500">
                      Via {institution.provider}
                    </span>
                  </InstitutionInfo> */}
              </div>
            </ConnectBankProvider>
          </li>
        );
      })}
    </ul>
  );
}

function InstitutionFilteredList({
  institutions,
}: {
  institutions: Awaited<ReturnType<typeof getFilteredInstitutions>>;
}) {
  return (
    <ul className="grid grid-cols-1 gap-4">
      {institutions.map((institution) => {
        return (
          <li key={institution.id}>
            <ConnectBankProvider
              id={institution.id}
              provider={institution.provider}
              availableHistory={institution.availableHistory ?? 0}
            >
              <div className="flex h-full items-center justify-start gap-4 rounded border p-4 hover:bg-slate-50">
                <Image
                  src={
                    institution.logo ??
                    "https://cdn-engine.midday.ai/default.jpg"
                  }
                  alt={institution.name + " logo"}
                  width={40}
                  height={40}
                />

                <div className="flex flex-col items-start gap-1">
                  <p className="text-sm font-medium leading-none">
                    {institution.name}
                  </p>
                  <InstitutionInfo provider={institution.provider}>
                    <span className="text-xs capitalize text-slate-500">
                      Via {institution.provider}
                    </span>
                  </InstitutionInfo>
                </div>
              </div>
            </ConnectBankProvider>
          </li>
        );
      })}
    </ul>
  );
}

export async function InstitutionListServer({
  country,
  query,
}: {
  country: string;
  query: string;
}) {
  const institutions = await getFilteredInstitutions({ country, q: query });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between">
        <p className="mb-2 text-sm font-medium">
          Banche popolari in: <Badge>{country}</Badge>
        </p>
        {query && (
          <p className="text-sm text-slate-500">
            Abbiamo trovato {institutions.length} istituti finanziari
          </p>
        )}
      </div>

      <ScrollArea className="flex-1">
        {!query ? (
          <InstitutionFeaturedList institutions={institutions} />
        ) : (
          <InstitutionFilteredList institutions={institutions} />
        )}
      </ScrollArea>
    </div>
  );
}
