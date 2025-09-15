import { z } from "@hono/zod-openapi";

export const createTransactionAttachmentSchema = z.array(
  z.object({
    path: z.array(z.string()),
    name: z.string(),
    size: z.number(),
    transactionId: z.string(),
    type: z.string(),
  }),
);

export const deleteTransactionAttachmentSchema = z.object({ id: z.uuid() });
