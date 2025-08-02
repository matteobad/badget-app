"server-only";

import { headers } from "next/headers";
import { currencies } from "~/shared/constants/currencies";

export async function getCountryCode() {
  const headersList = await headers();

  return headersList.get("x-vercel-ip-country") ?? "IT";
}

export async function getTimezone() {
  const headersList = await headers();

  return headersList.get("x-vercel-ip-timezone") ?? "Europe/Rome";
}

export async function getLocale() {
  const headersList = await headers();

  return headersList.get("x-vercel-ip-locale") ?? "it-IT";
}

export async function getCurrency() {
  const countryCode = await getCountryCode();

  return currencies[countryCode as keyof typeof currencies];
}
