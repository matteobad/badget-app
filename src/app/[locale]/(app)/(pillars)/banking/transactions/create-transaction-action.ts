"use server";

import { revalidateTag } from "next/cache";
import { and, eq } from "drizzle-orm";

import { authActionClient } from "~/lib/safe-action";
import {
  AttachmentDeleteSchema,
  TransactionInsertSchema,
} from "~/lib/validators/transactions";
import { db } from "~/server/db";
import { MUTATIONS } from "~/server/db/queries";
import {
  transaction_attachment_table as attachmentSchema,
  transaction_table as transactionSchema,
} from "~/server/db/schema/transactions";
import { utapi } from "~/server/uploadthing";

export const createTransactionAction = authActionClient
  .schema(TransactionInsertSchema)
  .metadata({ actionName: "create-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(transactionSchema)
        .values({ ...parsedInput, userId: ctx.userId })
        .returning({ insertedId: transactionSchema.id });

      if (!inserted[0]?.insertedId) return tx.rollback();

      for (const id of parsedInput.attachment_ids) {
        await tx
          .update(attachmentSchema)
          .set({ transactionId: inserted[0]?.insertedId })
          .where(
            and(
              eq(attachmentSchema.id, id),
              eq(attachmentSchema.userId, ctx.userId),
            ),
          );
      }
    });

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "Transaction created" };
  });

export const deleteAttachmentAction = authActionClient
  .schema(AttachmentDeleteSchema)
  .metadata({ actionName: "delete-attachment" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await MUTATIONS.deleteAttachment(parsedInput.id, ctx.userId);
    await utapi.deleteFiles(parsedInput.fileKey);

    // Invalidate cache
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "Attachment deleted" };
  });
