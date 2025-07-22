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
      const userId = ctx.session!.userId;
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
      const userId = ctx.session!.userId;

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
