"use client";

import { useQueryStates } from "nuqs";

import { searchParamsParsers } from "../_validations/dashboard-search-params-parsers";

export function useSearchParams() {
  return useQueryStates(searchParamsParsers);
}
