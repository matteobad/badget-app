import {
  createAttachments,
  deleteAttachment,
} from "~/server/services/transaction-attachment-service";
import {
  createTransactionAttachmentSchema,
  deleteTransactionAttachmentSchema,
} from "~/shared/validators/transaction-attachment.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const transactionAttachmentRouter = createTRPCRouter({
  createMany: protectedProcedure
    .input(createTransactionAttachmentSchema)
    .mutation(async ({ input, ctx: { db, orgId } }) => {
      return createAttachments(db, {
        organizationId: orgId!,
        attachments: input,
      });
    }),

  delete: protectedProcedure
    .input(deleteTransactionAttachmentSchema)
    .mutation(async ({ input, ctx: { db, orgId } }) => {
      return deleteAttachment(db, {
        id: input.id,
        organizationId: orgId!,
      });
    }),
});
