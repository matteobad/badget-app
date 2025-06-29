import { parseAsArrayOf, parseAsString } from "nuqs/server";
import z from "zod/v4";

export const dateRangeSchema = z.object(
  {
    from: z.date(),
    to: z.date(),
  },
  {
    error: "Please select a date range",
  },
);
// .refine((data) => data.from < data.to, {
//   path: ["dateRange"],
//   message: "From date must be before to date",
// });

export const sortParamsSchema = {
  sort: parseAsArrayOf(parseAsString),
};
