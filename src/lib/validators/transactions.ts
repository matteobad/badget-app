import { createInsertSchema } from "drizzle-zod";
import { type z } from "zod";

import { transaction_table } from "~/server/db/schema/transactions";

export const TransactionInsertSchema = createInsertSchema(
  transaction_table,
  {},
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export type TransactionInsertSchema = z.infer<typeof TransactionInsertSchema>;
