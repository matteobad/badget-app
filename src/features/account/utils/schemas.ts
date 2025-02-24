import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { account_table } from "~/server/db/schema/accounts";
import { AccountType, Provider } from "~/server/db/schema/enum";

export const AccountInsertSchema = createInsertSchema(account_table, {
  type: z.nativeEnum(AccountType),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const AccountUpdateSchema = createInsertSchema(account_table, {
  id: z.string(),
  type: z.nativeEnum(AccountType),
  description: z.string().optional(),
}).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const AccountDeleteSchema = z.object({
  ids: z.array(z.string()),
});

export const ConnectionDeleteSchema = z.object({
  id: z.string(),
  provider: z.nativeEnum(Provider).default("GOCARDLESS"),
});
