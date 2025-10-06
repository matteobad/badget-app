import type { ChatUserContext } from "~/server/cache/chat-cache";
import type { DBClient } from "~/server/db";
import { chatCache } from "~/server/cache/chat-cache";
import { getSpaceById } from "~/server/services/better-auth-service";
import { getUserById } from "~/server/services/user-service";
import { HTTPException } from "hono/http-exception";

interface GetUserContextParams {
  db: DBClient;
  userId: string;
  organizationId: string;
  country?: string;
  city?: string;
  timezone?: string;
}

/**
 * Gets user context for chat operations, with caching support
 * Fetches space and user data if not cached, then caches the result
 */
export async function getUserContext({
  db,
  userId,
  organizationId,
  country,
  city,
  timezone,
}: GetUserContextParams): Promise<ChatUserContext> {
  // Try to get cached context first
  const cached = await chatCache.getUserContext(userId, organizationId);
  if (cached) {
    return cached;
  }

  // If not cached, fetch space and user data in parallel
  const [space, user] = await Promise.all([
    getSpaceById(organizationId),
    getUserById(db, userId),
  ]);

  if (!space || !user) {
    throw new HTTPException(404, {
      message: "User or space not found",
    });
  }

  const context: ChatUserContext = {
    userId,
    organizationId,
    organizationName: space.name,
    fullName: user.name,
    baseCurrency: space.baseCurrency,
    locale: user.locale ?? "en-US",
    dateFormat: user.dateFormat,
    country,
    city,
    timezone,
  };

  // Cache for future requests (non-blocking)
  chatCache.setUserContext(userId, organizationId, context).catch((err) => {
    console.warn({
      msg: "Failed to cache user context",
      userId,
      organizationId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      error: err.message,
    });
  });

  return context;
}
