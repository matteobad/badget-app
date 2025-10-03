import { tool } from "ai";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import z from "zod";

export const getForecastSchema = z.object({
  from: z
    .string()
    .default(() => startOfMonth(subMonths(new Date(), 12)).toISOString())
    .describe(
      "The start date when to retrieve data from. Defaults to 12 months ago. Return ISO-8601 format.",
    ),
  to: z
    .string()
    .default(() => endOfMonth(new Date()).toISOString())
    .describe(
      "The end date when to retrieve data from. Defaults to end of current month. Return ISO-8601 format.",
    ),
});

export const getForecastTool = tool({
  description: "Get the forecast analysis for the user's account",
  inputSchema: getForecastSchema,
  execute: async function* () {
    yield { text: "Forecast analysis" };
  },
});
