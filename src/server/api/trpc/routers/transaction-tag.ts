import {
  createTransactionTag,
  deleteTransactionTag,
} from "~/server/services/transaction-tag-service";
import {
  createTransactionTagSchema,
  deleteTransactionTagSchema,
} from "~/shared/validators/transaction-tag.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const transactionTagRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTransactionTagSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return createTransactionTag(db, input, orgId!);
    }),

  delete: protectedProcedure
    .input(deleteTransactionTagSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return deleteTransactionTag(db, input, orgId!);
    }),
});
