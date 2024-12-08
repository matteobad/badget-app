import { and, eq } from "drizzle-orm";
import { type z } from "zod";

import { type workspaceParams } from "~/lib/validators/accounts";
import { db, schema } from "..";

export async function getAccountsQuery({
  userId,
  orgId,
}: z.infer<typeof workspaceParams>) {
  // @ts-expect-error placeholder condition
  const where = [eq(1, 1)];

  if (orgId) {
    where.push(eq(schema.workspaceToAccounts.groupId, orgId));
  }

  if (!orgId && userId) {
    where.push(eq(schema.workspaceToAccounts.userId, userId));
  }

  return await db.query.accounts.findMany({
    with: {
      institution: true,
      workspaceToAccounts: {
        where: and(...where),
      },
    },
  });
}
