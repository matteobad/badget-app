// import { tool } from "ai";
// import z from "zod";
// import { getTags } from "~/server/services/tag-service";

// import { cached } from "../../../cache";
// import { getContext } from "../../../context";

// // Input schema
// const toolInputSchema = z.object({
//   q: z
//     .string()
//     .optional()
//     .describe("Search query for filtering transactions tags by name."),
// });

// // Output schema
// const toolOutputSchema = z.object({
//   id: z.string().describe("Unique identifier of the tag."),
//   name: z.string().describe("Name of the tag."),
// });

// export const getTransacationsTagsTool = cached(
//   tool({
//     description: `
//     Retrieves transactions tags of the current user.

//     Use this tool when:
//     - the user asks to list, search, or view their transactions tags,
//     - they mention transactions tags by name (e.g. “transactions tagged X”),

//     Never use this tool to get accounts, transactions or categories.

//     Returns a structured list of tags, ideal for display in tables or cards.
//     Each item includes id, name.
//   `,
//     inputSchema: toolInputSchema,
//     outputSchema: toolOutputSchema,
//     execute: async (input) => {
//       const context = getContext();

//       try {
//         // Get accounts from database
//         const result = await getTags(
//           context.db,
//           input,
//           context.user.organizationId,
//         );

//         // Return validated output
//         return toolOutputSchema.parse(result ?? []);
//       } catch (error) {
//         console.error("getTransactionsTagsTool error:", error);
//         throw new Error("Failed to retrieve transactions tags.");
//       }
//     },
//   }),
// );
