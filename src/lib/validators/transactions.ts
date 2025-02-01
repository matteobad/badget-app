import { createInsertSchema } from "drizzle-zod";

import { transactions } from "~/server/db/schema/transactions";

export const CreateTransactionFormSchema = createInsertSchema(
  transactions,
  {},
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
