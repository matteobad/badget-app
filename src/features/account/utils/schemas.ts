import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { account_table } from "~/server/db/schema/accounts";
import { BankAccountType } from "~/server/db/schema/enum";

export const AccountInsertSchema = createInsertSchema(account_table, {
  type: z.nativeEnum(BankAccountType),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const AccountUpdateSchema = createInsertSchema(account_table, {
  id: z.string(),
  type: z.nativeEnum(BankAccountType),
}).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const AccountDeleteSchema = z.object({
  ids: z.array(z.string()),
});
