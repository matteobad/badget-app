"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useConnectParams } from "~/hooks/use-connect-params";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useDebounceValue } from "usehooks-ts";

import { BankLogo } from "../bank-logo";
import { CountrySelector } from "../country-selector";
import { InstitutionInfo } from "../institution-info";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { ConnectBankProvider } from "./connect-bank-provider";

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

function formatProvider(provider: string) {
  switch (provider) {
    case "enablebanking":
      return "Enable Banking";
    case "gocardless":
      return "GoCardLess";
    case "plaid":
      return "Plaid";
    case "teller":
      return "Teller";
  }
}

type SearchResultProps = {
  id: string;
  name: string;
  logo: string | null;
  provider: string;
  availableHistory: number;
  popularity: number;
  type?: "personal" | "business";
};

function SearchResult({
  id,
  name,
  logo,
  provider,
  availableHistory,
  popularity,
  type,
}: SearchResultProps) {
  return (
    <div className="flex justify-between">
      <div className="flex items-center">
        <BankLogo src={logo} alt={name} />

        <div className="ml-4 cursor-default">
          <p className="text-sm leading-none font-medium">{name}</p>
          <InstitutionInfo provider={provider}>
            <span className="text-xs font-light text-muted-foreground capitalize">
              Via {formatProvider(provider)}
              {type ? ` • ${type}` : ""}
            </span>
          </InstitutionInfo>
        </div>
      </div>

      <ConnectBankProvider
        id={id}
        name={name}
        provider={provider}
        availableHistory={availableHistory}
        popularity={popularity}
        type={type}
      />
    </div>
  );
}

type ConnectTransactionsModalProps = {
  countryCode: string;
};

export function ConnectBankDialog({
  countryCode: initialCountryCode,
}: ConnectTransactionsModalProps) {
  const trpc = useTRPC();
  const router = useRouter();

  const {
    countryCode,
    search: query,
    step,
    setParams: setConnectParams,
  } = useConnectParams(initialCountryCode);
  const { setParams: setTransactionParams } = useTransactionParams();

  const isOpen = step === "connect";

  const handleOnClose = () => {
    void setConnectParams({
      step: null,
      countryCode: null,
      search: null,
      ref: null,
    });
  };

  const [debouncedQuery] = useDebounceValue(query ?? "", 200);

  const { data, isLoading } = useQuery(
    trpc.institution.get.queryOptions(
      {
        q: debouncedQuery,
        countryCode,
      },
      {
        enabled: isOpen,
      },
    ),
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOnClose}>
      <DialogContent>
        <div className="">
          <DialogHeader>
            <DialogTitle>Connect bank account</DialogTitle>

            <DialogDescription>
              We work with a variety of banking providers to support as many
              banks as possible. If you can&apos;t find yours,{" "}
              <button
                type="button"
                className="underline"
                onClick={() => {
                  void setConnectParams({ step: "import" });
                }}
              >
                manual import
              </button>{" "}
              is available as an alternative.
            </DialogDescription>

            <div className="pt-4">
              <div className="flex space-x-0">
                <Input
                  className="border-r-0"
                  placeholder="Search your bank or financial institution..."
                  type="search"
                  onChange={(evt) =>
                    void setConnectParams({ search: evt.target.value || null })
                  }
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  autoFocus
                  value={query ?? ""}
                />

                <div className="">
                  <CountrySelector
                    align="end"
                    className="w-[220px]"
                    defaultValue={countryCode}
                    onSelect={(countryCode) => {
                      void setConnectParams({ countryCode });
                    }}
                  />
                </div>
              </div>

              <div className="scrollbar-hide mt-2 h-[430px] space-y-4 overflow-auto pt-2">
                {isLoading && <SearchSkeleton />}

                {data?.map((institution) => {
                  if (!institution) {
                    return null;
                  }

                  return (
                    <SearchResult
                      key={institution.id}
                      id={institution.originalId}
                      name={institution.name}
                      logo={institution.logo}
                      provider={institution.provider}
                      popularity={institution.popularity ?? 0}
                      // GoCardLess
                      availableHistory={
                        institution.availableHistory
                          ? +institution.availableHistory
                          : 0
                      }
                    />
                  );
                })}

                {!isLoading && data?.length === 0 && (
                  <div className="flex min-h-[350px] flex-col items-center justify-center">
                    <p className="mb-2 font-medium">No banks found</p>
                    <p className="text-center text-sm text-[#878787]">
                      We couldn&apos;t find a bank matching your criteria.
                      <br /> Let us know, or start with manual import.
                    </p>

                    <div className="mt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          void setConnectParams({
                            step: null,
                          });
                          void setTransactionParams({
                            importTransaction: true,
                          });
                        }}
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
