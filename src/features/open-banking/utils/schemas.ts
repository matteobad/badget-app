import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { account_table } from "~/server/db/schema/accounts";
import { Provider } from "~/server/db/schema/enum";
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
