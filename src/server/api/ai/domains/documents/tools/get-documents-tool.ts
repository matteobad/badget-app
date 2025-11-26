// import { tool } from "ai";
// import z from "zod";
// import { getDocuments } from "~/server/services/document-service";

// import { getContext } from "../../../context";

// const getDocumentsSchema = z.object({
//   pageSize: z
//     .number()
//     .min(1)
//     .max(50)
//     .default(10)
//     .describe("Number of documents to return per page (1-50). Default is 20."),
//   cursor: z
//     .string()
//     .nullable()
//     .optional()
//     .describe(
//       "Cursor for pagination, representing the offset or last item from the previous page.",
//     ),
//   language: z
//     .string()
//     .nullable()
//     .optional()
//     .describe(
//       "Language code to filter documents by language (e.g., 'it', 'en').",
//     ),
//   q: z
//     .string()
//     .nullable()
//     .optional()
//     .describe(
//       "Search query string to filter documents by title, summary, or content.",
//     ),
//   tags: z
//     .array(z.string())
//     .nullable()
//     .optional()
//     .describe("Array of tag IDs to filter documents by specific tags."),
//   start: z
//     .string()
//     .nullable()
//     .optional()
//     .describe(
//       "Start date (inclusive) for filtering documents in ISO 8601 format.",
//     ),
//   end: z
//     .string()
//     .nullable()
//     .optional()
//     .describe(
//       "End date (inclusive) for filtering documents in ISO 8601 format.",
//     ),
// });

// export const getDocumentsTool = tool({
//   description:
//     "Query the transaction tags table to search for and retrieve transaction tags. Use this tool when users request a list of tags, want to search for a specific tag by name, or need details about available transaction tags.",
//   inputSchema: getDocumentsSchema,
//   execute: async (input) => {
//     try {
//       const context = getContext();

//       // Prepare parameters for the database query
//       const params = {
//         organizationId: context.user.organizationId,
//         ...input,
//       };

//       // Get accounts from database
//       const result = await getDocuments(
//         context.db,
//         params,
//         context.user.organizationId,
//       );

//       return result;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   },
// });
