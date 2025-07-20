import { account_table } from "~/server/db/schema/accounts";
import { ACCOUNT_TYPE, BANK_PROVIDER } from "~/server/db/schema/enum";
import { connection_table } from "~/server/db/schema/open-banking";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ConnectGocardlessSchema = z.object({
  institutionId: z.string(),
  countryCode: z.string(),
  provider: z.enum(BANK_PROVIDER),
  redirectBase: z.url(),
});

export const ConnectedAccountSchema = createInsertSchema(account_table, {
  id: z.cuid2(),
  type: z.enum(ACCOUNT_TYPE),
}).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const ConnectionUpdateSchema = createInsertSchema(connection_table, {
  id: z.string(),
  provider: z.enum(BANK_PROVIDER),
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
  balance: z.string(),
  type: z.enum(ACCOUNT_TYPE),
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
  balance: z.string(),
  type: z.enum(ACCOUNT_TYPE),
  description: z.string().optional(),
}).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const AccountDeleteSchema = z.object({
  ids: z.array(z.cuid2()),
});

export const ConnectionDeleteSchema = z.object({
  id: z.string(),
  provider: z.enum(BANK_PROVIDER).default("GOCARDLESS"),
});
