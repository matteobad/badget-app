import { z } from "zod";

export const createActivitySchema = z.object({
  organizationId: z.uuid(),
  userId: z.uuid().optional(),
  type: z.enum(["transactions_exported"]),
  source: z.enum(["system", "user"]).default("system"),
  priority: z.number().int().min(1).max(10).default(5),
  groupId: z.uuid().optional(), // Links related activities together
  metadata: z.record(z.string(), z.any()), // Flexible - any JSON object
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;

export const userSchema = z.object({
  id: z.uuid(),
  full_name: z.string(),
  email: z.email(),
  locale: z.string().optional(),
  avatar_url: z.string().optional(),
  organization_id: z.uuid(),
  role: z.enum(["owner", "member"]).optional(),
});

export const transactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
  category: z.string().optional(),
  status: z.string().optional(),
});

export const transactionsCreatedSchema = z.object({
  users: z.array(userSchema),
  transactions: z.array(transactionSchema),
});

export const transactionsExportedSchema = z.object({
  users: z.array(userSchema),
  transactionCount: z.number(),
  locale: z.string(),
  dateFormat: z.string(),
  downloadLink: z.string().optional(),
  accountantEmail: z.string().optional(),
  sendEmail: z.boolean().optional(),
});

export const transactionsCategorizedSchema = z.object({
  users: z.array(userSchema),
  categorySlug: z.string(),
  transactionIds: z.array(z.string()),
});

export type UserData = z.infer<typeof userSchema>;
export type TransactionData = z.infer<typeof transactionSchema>;

export type TransactionsExportedInput = z.infer<
  typeof transactionsExportedSchema
>;

// Notification types map - all available notification types with their data structures
export type NotificationTypes = {
  transactions_exported: TransactionsExportedInput;
};
