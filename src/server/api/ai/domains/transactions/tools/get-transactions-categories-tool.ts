import { getTransactionCategories } from "~/server/services/transaction-category";
import { tool } from "ai";
import z from "zod";

import { getContext } from "../../../context";

const getTransactionsCategoriesSchema = z.object({
  q: z.string().optional().describe("Search query for transaction categories"),
});

export const getTransacationsCategoriesTool = tool({
  description:
    "Search and retrieve transaction categories from the database. Use this tool when a user asks for a list of categories, wants to find a category by name, or needs information about available transaction categories for organizing or analyzing.",
  inputSchema: getTransactionsCategoriesSchema,
  execute: async function ({ q }) {
    try {
      const context = getContext();

      // Prepare parameters for the database query
      const params = {
        q: q ?? null,
      };

      // Get accounts from database
      const result = await getTransactionCategories(
        context.db,
        params,
        context.user.organizationId,
      );

      // Early return if no data
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});
