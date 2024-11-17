"use client";

import { useQueryStates } from "nuqs";

import { searchParamsParsers } from "../_validations/search-params-parsers";

export function useSearchParams() {
  return useQueryStates(searchParamsParsers);
}
