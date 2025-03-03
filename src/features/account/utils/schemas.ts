import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { account_table } from "~/server/db/schema/accounts";
import { AccountType, Provider } from "~/server/db/schema/enum";
import { connection_table } from "~/server/db/schema/open-banking";

export const ConnectGocardlessSchema = z.object({
  institutionId: z.string(),
  countryCode: z.string().default("IT"),
  provider: z.nativeEnum(Provider),
  redirectBase: z.string().url(),
});

export const ConnectedAccountSchema = createInsertSchema(account_table, {
  id: z.string(),
}).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const ConnectionUpdateSchema = createInsertSchema(connection_table, {
  id: z.string(),
})
  .omit({
    userId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .extend({
    accounts: z.array(ConnectedAccountSchema).default([]),
  });

export const SyncConnectionSchema = z.object({
  ref: z.string(),
});

export const AccountInsertSchema = createInsertSchema(account_table, {
  balance: z.coerce.string(),
  type: z.nativeEnum(AccountType),
  description: z.string().optional(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const AccountUpdateSchema = createInsertSchema(account_table, {
  id: z.string(),
  balance: z.coerce.string(),
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
