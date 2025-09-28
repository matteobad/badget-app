import { redis } from "../redis";

// Redis-based cache for chat data shared across all server instances
const userContextCachePrefix = "chat:user";
const userContextCacheTTL = 30 * 60; // 30 minutes TTL

// Disable caching in development
const isDevelopment = process.env.NODE_ENV === "development";

export interface ChatUserContext {
  userId: string;
  organizationId: string;
  organizationName?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  baseCurrency?: string | null;
  countryCode?: string | null;
  dateFormat?: string | null;
  locale?: string | null;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  timezone?: string | null;
}

export const chatCache = {
  getUserContext: (userId: string, organizationId: string) => {
    if (isDevelopment) return Promise.resolve(null);
    return redis.get<ChatUserContext>(
      `${userContextCachePrefix}${userId}:${organizationId}`,
    );
  },

  setUserContext: (
    userId: string,
    organizationId: string,
    context: ChatUserContext,
  ) => {
    if (isDevelopment) return Promise.resolve();
    return redis.set(
      `${userContextCachePrefix}${userId}:${organizationId}`,
      context,
      { ex: userContextCacheTTL },
    );
  },
};
