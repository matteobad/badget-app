import { withTransaction } from "~/server/db";
import {
  createTagMutation,
  deleteTagMutation,
} from "~/server/domain/tag/mutations";
import { getTagByTextQuery } from "~/server/domain/tag/queries";
import {
  createTransactionToTagMutation,
  deleteTransactionToTagMutation,
} from "~/server/domain/transaction-tag/mutations";
import { existsTransactionToTagQuery } from "~/server/domain/transaction-tag/queries";
import {
  createTransactionTagSchema,
  deleteTransactionTagSchema,
} from "~/shared/validators/transaction-tag.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const transactionTagRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTransactionTagSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      const inputTag = { ...input.tag, userId };

      return await withTransaction(async (tx) => {
        let tag = await getTagByTextQuery(tx, inputTag);
        tag ??= await createTagMutation(tx, inputTag);

        if (!tag) return tx.rollback();

        await createTransactionToTagMutation(tx, {
          tagId: tag.id,
          transactionId: input.transactionId,
        });

        return tag;
      });
    }),

  delete: protectedProcedure
    .input(deleteTransactionTagSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;

      return withTransaction(async (tx) => {
        await deleteTransactionToTagMutation(tx, input);
        const tagHasMoreTransactions = await existsTransactionToTagQuery(tx, {
          tagId: input.tagId,
        });
        if (!tagHasMoreTransactions) {
          await deleteTagMutation(tx, { id: input.tagId, userId });
        }
      });
    }),
});

// export async function updateTransactionTagsMutation(
//   tx: DBClient,
//   input: z.infer<typeof updateTransactionTagsSchema>,
//   userId: string,
// ) {
//   const { transactionId, tags } = input;

//   const existingTags = await tx
//     .select({
//       id: transaction_to_tag_table.tagId,
//       text: tag_table.text,
//     })
//     .from(transaction_to_tag_table)
//     .innerJoin(tag_table, eq(transaction_to_tag_table.tagId, tag_table.id))
//     .where(eq(transaction_to_tag_table.transactionId, transactionId));
//   const existingTagNames = existingTags.map((t) => t.text);

//   // Determine tags to add and remove
//   const tagsToAdd = tags.filter((name) => !existingTagNames.includes(name));
//   const tagsToRemove = existingTags.filter((tag) => !tags.includes(tag.text));

//   let newTagIds: string[] = [];

//   // Create tags if they don’t exist
//   if (tagsToAdd.length > 0) {
//     const existingTagRecords = await tx
//       .select({ id: tag_table.id, name: tag_table.text })
//       .from(tag_table)
//       .where(inArray(tag_table.text, tagsToAdd));

//     const existingTagMap = new Map(
//       existingTagRecords.map((t) => [t.name, t.id]),
//     );

//     const tagsToInsert = tagsToAdd.filter((name) => !existingTagMap.has(name));

//     if (tagsToInsert.length > 0) {
//       const insertedTags = await tx
//         .insert(tag_table)
//         .values(tagsToInsert.map((text) => ({ text, userId })))
//         .returning({ id: tag_table.id, text: tag_table.text });

//       insertedTags.forEach(({ id, text }) => existingTagMap.set(text, id));
//     }

//     newTagIds = tagsToAdd.map((name) => existingTagMap.get(name)!);
//   }

//   // Insert new tag associations
//   if (newTagIds.length > 0) {
//     await tx.insert(transaction_to_tag_table).values(
//       newTagIds.map((tagId) => ({
//         transactionId,
//         tagId,
//       })),
//     );
//   }

//   // Remove old tag associations
//   if (tagsToRemove.length > 0) {
//     const tagIdsToRemove = tagsToRemove.map((tag) => tag.id);

//     await tx
//       .delete(transaction_to_tag_table)
//       .where(
//         and(
//           eq(transaction_to_tag_table.transactionId, transactionId),
//           inArray(transaction_to_tag_table.tagId, tagIdsToRemove),
//         ),
//       );

//     // Delete tags if they are no longer used
//     const unusedTags = await tx
//       .select({ id: transaction_to_tag_table.tagId })
//       .from(transaction_to_tag_table)
//       .where(inArray(transaction_to_tag_table.tagId, tagIdsToRemove));

//     const unusedTagIds = tagIdsToRemove.filter(
//       (id) => !unusedTags.some((t) => t.id === id),
//     );

//     if (unusedTagIds.length > 0) {
//       await tx.delete(tag_table).where(inArray(tag_table.id, unusedTagIds));
//     }
//   }
// }
