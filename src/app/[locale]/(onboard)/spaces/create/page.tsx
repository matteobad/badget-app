import type { Metadata } from "next";
import Link from "next/link";
import { CreateSpaceForm } from "~/components/organization/forms/create-org-form";
import {
  getCountryCode,
  getCurrency,
} from "~/server/services/location-service";
import { RocketIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Space | Badget.",
};

export default function CreateTeam() {
  const currency = getCurrency();
  const countryCode = getCountryCode();

  return (
    <>
      <header className="absolute right-0 left-0 flex w-full items-center justify-between">
        <div className="mt-4 ml-5 md:mt-10 md:ml-10">
          <Link href="/">
            <RocketIcon />
          </Link>
        </div>
      </header>

      <div className="flex min-h-screen items-center justify-center overflow-hidden p-6 md:p-0">
        <div className="relative z-20 m-auto flex w-full max-w-[400px] flex-col">
          <div className="text-center">
            <h1 className="mb-2 font-serif text-lg">Setup your space</h1>
            <p className="mb-8 text-sm text-[#878787]">
              Create a new space to manage your finances—either just for
              yourself, or together with family. Each space has its own accounts
              and settings, so you can keep everything organized just the way
              you want.
            </p>
          </div>

          <CreateSpaceForm
            defaultCurrencyPromise={currency}
            defaultCountryCodePromise={countryCode}
          />
        </div>
      </div>
    </>
  );
}
