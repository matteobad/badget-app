"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { useConnectParams } from "~/hooks/use-connect-params";
import { getInstitutions } from "~/server/actions/institutions/get-institutions";
import { type Provider } from "~/server/db/schema/enum";
import { BankLogo } from "../bank-logo";
import { ConnectBankProvider } from "../connect-bank-provider";
import { InstitutionInfo } from "../institution-info";

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from(new Array(10), (_, index) => (
        <div className="flex items-center space-x-4" key={index.toString()}>
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex flex-col space-y-1">
            <Skeleton className="h-2 w-[140px] rounded-none" />
            <Skeleton className="h-2 w-[40px] rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchResult({
  id,
  name,
  logo,
  provider,
  availableHistory,
}: {
  id: string;
  name: string;
  logo: string | null;
  provider: Provider;
  availableHistory: number;
}) {
  return (
    <div className="flex justify-between">
      <div className="flex items-center">
        <BankLogo src={logo} alt={name} />

        <div className="ml-4 cursor-default space-y-1">
          <p className="text-sm font-medium leading-none">{name}</p>
          <InstitutionInfo provider={provider}>
            <span className="text-xs capitalize text-[#878787]">
              Via {provider}
            </span>
          </InstitutionInfo>
        </div>
      </div>

      <ConnectBankProvider
        id={id}
        provider={provider}
        availableHistory={availableHistory}
      />
    </div>
  );
}

type Institution = Awaited<ReturnType<typeof getInstitutions>>[number];

export function ConnectBankModal({
  countryCode: initialCountryCode,
}: {
  countryCode: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Institution[]>([]);

  const {
    countryCode,
    q: query,
    step,
    setParams,
  } = useConnectParams(initialCountryCode);

  const isOpen = step === "connect";
  const [debouncedSearchTerm] = useDebounce(query, 200);

  const handleOnClose = () => {
    void setParams(
      {
        step: null,
        countryCode: null,
        q: null,
      },
      {
        // NOTE: Rerender so the overview modal is visible
        shallow: false,
      },
    );
  };

  async function fetchData(query?: string) {
    try {
      setLoading(true);
      const data = await getInstitutions({ countryCode, query });
      setLoading(false);

      setResults(data);
    } catch {
      setLoading(false);
      setResults([]);
    }
  }

  useEffect(() => {
    if ((isOpen && results?.length > 0) || countryCode !== initialCountryCode) {
      void fetchData();
    }
  }, [isOpen, countryCode]);

  useEffect(() => {
    if (isOpen) {
      void fetchData(debouncedSearchTerm ?? undefined);
    }
  }, [debouncedSearchTerm, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOnClose}>
      <DialogContent>
        <div className="p-4">
          <DialogHeader>
            <DialogTitle>Connect Transactions</DialogTitle>

            <DialogDescription>
              We work with a variety of banking providers to support as many
              banks as possible. If you can&apos;t find yours,{" "}
              <button
                type="button"
                className="underline"
                onClick={() => setParams({ step: "import" })}
              >
                manual import
              </button>{" "}
              is available as an alternative.
            </DialogDescription>

            <div className="pt-4">
              <div className="relative flex space-x-2">
                <Input
                  placeholder="Search bank..."
                  type="search"
                  onChange={(evt) => setParams({ q: evt.target.value || null })}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  autoFocus
                  value={query ?? ""}
                />

                {/* <div className="absolute right-0">
                  <CountrySelector
                    defaultValue={countryCode}
                    onSelect={(countryCode) => {
                      setParams({ countryCode });
                      setResults([]);
                    }}
                  />
                </div> */}
              </div>

              <div className="scrollbar-hide mt-2 h-[430px] space-y-4 overflow-auto pt-2">
                {loading && <SearchSkeleton />}

                {results?.map((institution) => {
                  if (!institution) {
                    return null;
                  }

                  return (
                    <SearchResult
                      key={institution.id}
                      id={institution.id}
                      name={institution.name}
                      logo={institution.logo}
                      provider={institution.provider}
                      availableHistory={
                        institution.availableHistory
                          ? +institution.availableHistory
                          : 0
                      }
                    />
                  );
                })}

                {!loading && results.length === 0 && (
                  <div className="flex min-h-[350px] flex-col items-center justify-center">
                    <p className="mb-2 font-medium">No banks found</p>
                    <p className="text-center text-sm text-[#878787]">
                      We couldn&apos;t find a bank matching your criteria.
                      <br /> Let us know, or start with manual import.
                    </p>

                    <div className="mt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setParams({ step: "import" })}
                      >
                        Import
                      </Button>

                      <Button
                        onClick={() => {
                          router.push("/account/support");
                        }}
                      >
                        Contact us
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  );
}
