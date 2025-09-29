import { redis } from "../redis";

// Redis-based cache for chat data shared across all server instances
const suggestedActionsCachePrefix = "suggested-actions";
const userContextCacheTTL = 24 * 60 * 60; // 24 hours TTL

export interface SuggestedActionUsage {
  actionId: string;
  count: number;
  lastUsed: Date;
}

export const suggestedActionsCache = {
  // Get usage stats for a specific action
  getUsage: async (
    organizationId: string,
    userId: string,
    actionId: string,
  ) => {
    const key = `${suggestedActionsCachePrefix}${organizationId}:${userId}:${actionId}`;
    return redis.get<SuggestedActionUsage>(key);
  },

  // Get all usage stats for a user in a team
  getAllUsage: async (
    organizationId: string,
    userId: string,
  ): Promise<Record<string, SuggestedActionUsage>> => {
    // Note: Redis doesn't support pattern matching efficiently
    // We'll store a summary object as well for efficient retrieval
    const summaryKey = `${suggestedActionsCachePrefix}${organizationId}:${userId}:summary`;
    const summary =
      await redis.get<Record<string, SuggestedActionUsage>>(summaryKey);
    return summary || {};
  },

  // Increment usage for a specific action
  incrementUsage: async (
    organizationId: string,
    userId: string,
    actionId: string,
  ): Promise<void> => {
    const key = `${suggestedActionsCachePrefix}${organizationId}:${userId}:${actionId}`;
    const summaryKey = `${organizationId}:${userId}:summary`;

    // Get current usage
    const currentUsage = (await redis.get<SuggestedActionUsage>(key)) || {
      actionId,
      count: 0,
      lastUsed: new Date(),
    };

    // Update usage
    const updatedUsage: SuggestedActionUsage = {
      ...currentUsage,
      count: currentUsage.count + 1,
      lastUsed: new Date(),
    };

    // Update individual action cache
    await redis.set(key, updatedUsage, { ex: userContextCacheTTL });

    // Update summary cache
    const currentSummary =
      (await redis.get<Record<string, SuggestedActionUsage>>(summaryKey)) || {};
    currentSummary[actionId] = updatedUsage;
    await redis.set(summaryKey, currentSummary, { ex: userContextCacheTTL });
  },

  // Clear usage for a specific action
  clearUsage: async (
    organizationId: string,
    userId: string,
    actionId: string,
  ): Promise<void> => {
    const key = `${suggestedActionsCachePrefix}${organizationId}:${userId}:${actionId}`;
    const summaryKey = `${organizationId}:${userId}:summary`;

    await redis.del(key);

    // Update summary
    const currentSummary =
      (await redis.get<Record<string, SuggestedActionUsage>>(summaryKey)) || {};
    delete currentSummary[actionId];
    await redis.set(summaryKey, currentSummary, { ex: userContextCacheTTL });
  },

  // Clear all usage for a user in a team
  clearAllUsage: async (
    organizationId: string,
    userId: string,
  ): Promise<void> => {
    const summaryKey = `${suggestedActionsCachePrefix}${organizationId}:${userId}:summary`;
    const summary =
      (await redis.get<Record<string, SuggestedActionUsage>>(summaryKey)) || {};

    // Delete all individual action caches
    for (const actionId of Object.keys(summary)) {
      const key = `${organizationId}:${userId}:${actionId}`;
      await redis.del(key);
    }

    // Delete summary
    await redis.del(summaryKey);
  },
};
