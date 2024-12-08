import { unstable_cache } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { getAccountsQuery } from "./accounts-queries";

export async function getAccountsForActiveWorkspace() {
  const { orgId, userId } = await auth();

  const cacheKeys = ["accounts"];
  orgId && cacheKeys.push(orgId);
  !orgId && userId && cacheKeys.push(userId);

  return unstable_cache(
    async () => {
      return await getAccountsQuery({ orgId, userId });
    },
    [...cacheKeys],
    {
      tags: [...cacheKeys],
      revalidate: 3600,
    },
  )();
}
