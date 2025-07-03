import { transaction_to_tag_table } from "~/server/db/schema/transactions";
import { createInsertSchema } from "drizzle-zod";
import z from "zod/v4";

export const createTransactionToTagSchema = createInsertSchema(
  transaction_to_tag_table,
);

export const createTransactionTagSchema = z.object({
  transactionId: z.string().min(1), // TODO: change to cuid2
  tag: z.object({
    id: z.string().min(1), // TODO: change to cuid2
    text: z.string().min(3),
  }),
});

export const deleteTransactionTagSchema = z.object({
  tagId: z.string().min(1), // TODO: change to cuid2
  transactionId: z.string().min(1), // TODO: change to cuid2
});
