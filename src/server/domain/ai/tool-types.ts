import type { InferUITools } from "ai";
import { google } from "@ai-sdk/google";

// import { getContext } from "./context";
import { getTransactionsTool } from "./tools/get-transactions";

// Tool registry function - this creates the actual tool implementations
export const createToolRegistry = () => {
  // const context = getContext();

  return {
    // getBurnRate: getBurnRateTool,
    // getBurnRateAnalysis: getBurnRateAnalysisTool,
    getTransactions: getTransactionsTool,
    // web_search: google.tools.googleSearch({
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
