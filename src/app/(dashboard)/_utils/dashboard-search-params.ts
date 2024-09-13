import { createSearchParamsCache } from "nuqs/server";

import { dashboardSearchParamsParsers } from "../_validations/dashboard-search-params-parsers";

export const dashboardSearchParamsCache = createSearchParamsCache(
  dashboardSearchParamsParsers,
);
