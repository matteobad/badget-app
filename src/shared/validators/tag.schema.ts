import { tag_table } from "~/server/db/schema/transactions";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod/v4";

export const createTagSchema = createInsertSchema(tag_table);

export const updateTagSchema = createUpdateSchema(tag_table, {
  id: z.cuid2(),
});

export const deleteTagSchema = z.object({
  id: z.cuid2(),
  userId: z.string().min(1),
});

export const getTagsSchema = z.object({});

export const getTransactionTagsSchema = z.object({
  transactionId: z.cuid2(),
});
