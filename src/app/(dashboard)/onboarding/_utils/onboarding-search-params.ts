import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const onboardingParsers = {
  step: parseAsString.withDefault(""),
  orgId: parseAsString.withDefault(""),
};

export const onboardingSearchParamsCache =
  createSearchParamsCache(onboardingParsers);
