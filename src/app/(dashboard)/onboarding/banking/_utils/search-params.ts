import { createSearchParamsCache } from "nuqs/server";

import { searchParamsParsers } from "../_validations/search-params-parsers";

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);
