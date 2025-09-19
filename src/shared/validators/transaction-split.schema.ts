import { z } from "zod/v4";

export const transactionSplitItemSchema = z.object({
  categorySlug: z.string().optional(),
  amount: z.number(),
  note: z.string().optional(),
});

export const addTransactionSplitsSchema = z.object({
  transactionId: z.uuid(),
  splits: z.array(transactionSplitItemSchema).min(2),
});

export const deleteTransactionSplitSchema = z.object({
  transactionId: z.uuid(),
});

export const getTransactionSplitsSchema = z.object({
  transactionId: z.uuid(),
});

export type TransactionSplitItem = z.infer<typeof transactionSplitItemSchema>;
