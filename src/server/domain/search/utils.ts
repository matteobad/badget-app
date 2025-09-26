import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const schema = z.object({
  searchTerm: z.string().describe("The query to search for"),
  startDate: z
    .string()
    .optional()
    .describe("The start date when to retrieve from. Return ISO-8601 format."),
  endDate: z
    .string()
    .optional()
    .describe(
      "The end date when to retrieve data from. If not provided, defaults to the current date. Return ISO-8601 format.",
    ),
  types: z
    .array(
      z.enum([
        "transactions",
        "invoices",
        "tracker_projects",
        "customers",
        "documents",
      ]),
    )
    .describe("The type of the items to search for"),
  amount: z
    .number()
    .optional()
    .describe(
      "The exact amount to search for if the type is transactions or invoices.",
    ),
  amountMin: z
    .number()
    .optional()
    .describe("Minimum amount filter for transactions or invoices."),
  amountMax: z
    .number()
    .optional()
    .describe("Maximum amount filter for transactions or invoices."),
  status: z
    .enum(["paid", "unpaid", "overdue", "draft"])
    .optional()
    .describe(
      "The status filter (e.g. 'paid', 'unpaid', 'overdue', 'draft') for invoices or projects.",
    ),
  currency: z
    .string()
    .optional()
    .describe("The currency code to filter by (e.g., 'EUR', 'USD')."),
  language: z
    .string()
    .describe(
      "The language to search in based on the query. Return in PostgreSQL text search configuration name (e.g., 'english', 'swedish', 'german', 'french').",
    ),
  dueDateStart: z
    .string()
    .optional()
    .describe("Start date for invoice due dates (ISO-8601)."),
  dueDateEnd: z
    .string()
    .optional()
    .describe("End date for invoice due dates (ISO-8601)."),
});

export async function generateLLMFilters(
  query: string,
): Promise<z.infer<typeof schema>> {
  const { object } = await generateObject({
    model: google("gemini-2.5-flash-lite"),
    system: `You are an AI assistant that converts natural language search queries into structured search filters.

Current date: ${new Date().toISOString().split("T")[0]}

GUIDELINES:
- Extract search terms, date ranges, amounts, and other filters from the query
- When dates are mentioned but incomplete (like "March" or "last year"), infer reasonable date ranges
- For currency values, default to the user's local currency if not specified
- Choose appropriate types based on the query context:
  * "transactions" for money movements, payments, expenses
  * "documents" for files, attachments, contracts, receipts, bills, invoices etc, but also in the query like "invoices from vendor X"

EXAMPLES:
- "show me invoices from last month" → {types: ["documents"], startDate: "2023-05-01", endDate: "2023-05-31", language: "english"}
- "show me invoices from vendor X" → {types: ["documents"], searchTerm: "vendor X", language: "english"}
- "transactions with Apple between January and March" → {types: ["transactions"], searchTerm: "Apple", startDate: "2024-01-01", endDate: "2024-03-31", language: "english"}

For language, detect the appropriate language of the query for PostgreSQL text search.
`,
    schema,
    prompt: query,
  });

  return object;
}
