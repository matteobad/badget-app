"server-only";

import { and, asc, eq } from "drizzle-orm";

import type { DBClient } from "..";
import { type ToggleAccountType } from "~/lib/validators";
import { db } from "..";
import { account_table as accountSchema } from "../schema/accounts";
import { connection_table as connectionSchema } from "../schema/open-banking";

export const QUERIES = {
  getAccountsForUser: function (userId: string, client: DBClient = db) {
    return client
      .select()
      .from(accountSchema)
      .where(eq(accountSchema.userId, userId))
      .orderBy(accountSchema.name);
  },
  getDisabledAccountsForUser: function (userId: string, client: DBClient = db) {
    return client
      .select({ rawId: accountSchema.rawId })
      .from(accountSchema)
      .where(
        and(eq(accountSchema.userId, userId), eq(accountSchema.enabled, false)),
      );
  },
  getAccountsWithConnectionsForUser: function (
    userId: string,
    client: DBClient = db,
  ) {
    return client.query.connection_table.findMany({
      with: {
        accounts: { orderBy: asc(accountSchema.createdAt) },
        institution: true,
      },
      where: eq(connectionSchema.userId, userId),
    });
  },
};

export const MUTATIONS = {
  toggleAccount: function (params: ToggleAccountType, client: DBClient = db) {
    return client
      .update(accountSchema)
      .set({ enabled: params.enabled })
      .where(eq(accountSchema.id, params.id));
  },
};
