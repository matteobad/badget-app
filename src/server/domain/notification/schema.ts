import { z } from "zod";

export const userSchema = z.object({
  id: z.uuid(),
  full_name: z.string(),
  email: z.email(),
  locale: z.string().optional(),
  avatar_url: z.string().optional(),
  organization_id: z.uuid(),
  role: z.enum(["owner", "member"]).optional(),
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

export type TransactionsExportedInput = z.infer<
  typeof transactionsExportedSchema
>;
// Notification types map - all available notification types with their data structures
export type NotificationTypes = {
  transactions_exported: TransactionsExportedInput;
};
