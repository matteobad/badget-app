import { createCacheBackend, createCachedFunction } from "@ai-sdk-tools/cache";
import { env } from "~/env";

const backend = createCacheBackend({
  type: "lru",
  defaultTTL: 60 * 60 * 24,
});

export const cached = createCachedFunction(backend, {
  debug: env.NODE_ENV === "development",
});
