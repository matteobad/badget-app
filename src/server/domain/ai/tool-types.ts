import type { InferUITools } from "ai";

// import { google } from "@ai-sdk/google";

import { getExpensesBreakdownTool } from "./tools/get-expenses-breakdown-tool";
import { getForecastTool } from "./tools/get-forecast-tool";
import { getNetWorthAnalysisTool } from "./tools/get-net-worth-analysis-tool";
// import { getContext } from "./context";
import { getTransactionsTool } from "./tools/get-transactions-tool";

// Tool registry function - this creates the actual tool implementations
export const createToolRegistry = () => {
  // const context = getContext();

  return {
    getNetWorthAnalysis: getNetWorthAnalysisTool,
    getTransactions: getTransactionsTool,
    getExpensesBreakdown: getExpensesBreakdownTool,
    getForecast: getForecastTool,
    // google_search: google.tools.googleSearch({
    // searchContextSize: "medium",
    // userLocation: {
    //   type: "approximate",
    //   country: context.user.country ?? undefined,
    //   city: context.user.city ?? undefined,
    //   region: context.user.region ?? undefined,
    // },
    // }),
  };
};

// Infer the UI tools type from the registry
export type UITools = InferUITools<ReturnType<typeof createToolRegistry>>;
