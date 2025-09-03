import { z } from "zod/v4";

export const transactionSplitItemSchema = z.object({
  category: z
    .object({
      id: z.uuid(),
      slug: z.string(),
      name: z.string(),
      icon: z.string().nullable(),
      color: z.string().nullable(),
    })
    .optional(),
  amount: z.number(),
  note: z.string().optional(),
});

export const addTransactionSplitsSchema = z.object({
  transactionId: z.uuid(),
  splits: z.array(transactionSplitItemSchema).min(2),
});

export const updateTransactionSplitSchema = z.object({
  splitId: z.uuid(),
  data: z
    .object({
      categoryId: z.uuid().optional(),
      amount: z.number().positive().optional(),
      note: z.string().optional(),
    })
    .refine((d) => Object.keys(d).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const deleteTransactionSplitSchema = z.object({
  splitId: z.uuid(),
});

export const getTransactionSplitsSchema = z.object({
  transactionId: z.uuid(),
});

export type TransactionSplitItem = z.infer<typeof transactionSplitItemSchema>;
