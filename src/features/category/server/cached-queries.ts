import "server-only";

import { unstable_cache } from "next/cache";

import { getCategories_QUERY, getTags_QUERY } from "./queries";

export const getCategories_CACHED = (userId: string) => {
  const cacheKeys = ["category", `category_${userId}`];

  return unstable_cache(
    async () => {
      const data = await getCategories_QUERY(userId);
      return data;
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};

export const getTags_CACHED = (userId: string) => {
  const cacheKeys = ["tag", `tag_${userId}`];

  return unstable_cache(
    async () => {
      const data = await getTags_QUERY(userId);
      return data;
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};
