"server-only";

import { headers } from "next/headers";
import { countryFlags, EU_COUNTRY_CODES } from "~/shared/constants/countries";
import countries from "~/shared/constants/countries-intl.json";
import { currencies } from "~/shared/constants/currencies";
import timezones from "~/shared/constants/timezones.json";

export async function getCountryCode() {
  const headersList = await headers();

  return headersList.get("x-vercel-ip-country") ?? "IT";
}

export async function getTimezone() {
  const headersList = await headers();

  return headersList.get("x-vercel-ip-timezone") ?? "Europe/Rome";
}

export function getTimezones() {
  return timezones;
}

export async function getLocale() {
  const headersList = await headers();

  return headersList.get("x-vercel-ip-locale") ?? "it-IT";
}

export async function getCurrency() {
  const countryCode = await getCountryCode();

  return currencies[countryCode as keyof typeof currencies];
}

export async function getDateFormat() {
  const country = await getCountryCode();

  // US uses MM/dd/yyyy
  if (country === "US") {
    return "MM/dd/yyyy";
  }

  // China, Japan, Korea, Taiwan use yyyy-MM-dd
  if (["CN", "JP", "KR", "TW"].includes(country)) {
    return "yyyy-MM-dd";
  }
  // Most Latin American, African, and some Asian countries use dd/MM/yyyy
  if (["AU", "NZ", "IN", "ZA", "BR", "AR"].includes(country)) {
    return "dd/MM/yyyy";
  }

  // Default to yyyy-MM-dd for other countries
  return "yyyy-MM-dd";
}

export async function isEU() {
  const countryCode = await getCountryCode();

  if (countryCode && EU_COUNTRY_CODES.includes(countryCode)) {
    return true;
  }

  return false;
}

export async function getCountry() {
  const country = await getCountryCode();

  // Type guard to ensure country is a key of flags
  if (country && Object.hasOwn(countryFlags, country)) {
    return countryFlags[country as keyof typeof countryFlags];
  }

  return undefined;
}

export function getCountries() {
  return countries;
}
