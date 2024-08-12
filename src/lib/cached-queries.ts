import { unstable_cache } from "next/cache";

import { db, schema } from "~/server/db";

export async function findAllInstitutions() {
  return unstable_cache(
    async () => {
      return await db.select().from(schema.institutions);
    },
    ["institutions"],
    {
      tags: ["institutions"],
      revalidate: 3600,
    },
  )();
}

export type GetPensionAccountsReturnType = ReturnType<
  typeof findAllInstitutions
>;
