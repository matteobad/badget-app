import { getTags } from "~/server/services/tag-service";
import { tool } from "ai";
import z from "zod";

import { getContext } from "../../../context";

const getTransactionsTagsSchema = z.object({
  // q: z.string().optional().describe("Search query for transaction tags"),
});

export const getTransacationsTagsTool = tool({
  description:
    "Search and retrieve transaction tags from the database. Use this tool when a user asks for a list of tags, wants to find a tag by name, or needs information about available transaction tags for organizing or analyzing.",
  inputSchema: getTransactionsTagsSchema,
  execute: async function ({}) {
    try {
      const context = getContext();

      // Prepare parameters for the database query
      // const params = {
      //   q: q ?? null,
      // };

      // Get accounts from database
      const result = await getTags(context.db, context.user.organizationId);

      // Early return if no data
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});
