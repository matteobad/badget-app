import { endOfMonth, startOfMonth } from "date-fns";
import { parseAsIsoDateTime } from "nuqs/server";

export const dashboardSearchParamsParsers = {
  // List your search param keys and associated parsers here:
  from: parseAsIsoDateTime.withDefault(startOfMonth(new Date())),
  to: parseAsIsoDateTime.withDefault(endOfMonth(new Date())),
};
