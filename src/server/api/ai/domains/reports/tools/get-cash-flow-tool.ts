import { tool } from "ai";
import z from "zod";

const getCashFlowSchema = z.object({});

export const getCashFlowTool = tool({
  description:
    "Retrieve a detailed cash flow for the user's accounts,  including net cash position over a selected period.",
  inputSchema: getCashFlowSchema,
  execute: async function* () {
    yield { text: "Cash flow analysis" };
  },
});
