import { tool } from "ai";
import z from "zod";
import { getInstitutions } from "~/server/services/institution-service";

import { getContext } from "../../../context";

const getInstitutionsSchema = z.object({
  q: z
    .string()
    .optional()
    .describe(
      "Optional search query to filter institutions by name or other attributes.",
    ),
  countryCode: z
    .string()
    .describe(
      "The country code (e.g., 'US', 'GB') to filter institutions by their country.",
    ),
});

export const getInstitutionsTool = tool({
  description:
    "Search and retrieve financial institutions (such as banks) by name or country code. Use this tool when users request a list of available institutions, want to search for a specific institution, or need details about supported institutions in a particular country.",
  inputSchema: getInstitutionsSchema,
  execute: async ({ q, countryCode }) => {
    try {
      const context = getContext();

      // Prepare parameters for the database query
      const params = {
        q: q,
        countryCode: countryCode ?? context.user.locale?.toUpperCase() ?? "IT",
      };

      // Get accounts from database
      const result = await getInstitutions(params);

      // Early return if no data
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});
