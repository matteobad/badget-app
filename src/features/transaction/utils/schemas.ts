import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { TagInsertSchema } from "~/lib/validators";
import { transaction_table } from "~/server/db/schema/transactions";

export const TransactionInsertSchema = createInsertSchema(transaction_table, {
  date: z.coerce.date(),
  amount: z.coerce.string(),
  note: z.string().optional(),
})
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .extend({
    attachment_ids: z.array(z.string()),
    tags: z.array(TagInsertSchema).default([]),
  });

export const TransactionUpdateSchema = createInsertSchema(transaction_table, {
  id: z.string(),
  date: z.coerce.date().optional(),
  amount: z.coerce.string().optional(),
  note: z.string().optional(),
})
  .omit({
    userId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .extend({
    attachment_ids: z.array(z.string()),
    tags: z.array(TagInsertSchema).default([]),
  });

export const TransactionDeleteSchema = z.object({
  ids: z.array(z.string()),
});

export const CategorizeTransactionSchema = z.object({
  description: z.string(),
});

export const AttachmentDeleteSchema = z.object({
  id: z.string(),
  fileKey: z.string(),
});
