import type { DBClient } from "~/server/db";
import type {
  activityStatusEnum,
  activityTypeEnum,
} from "~/server/db/schema/notifications";
import type { SQL } from "drizzle-orm/sql/sql";
import { activity_table } from "~/server/db/schema/notifications";
import { and, desc, eq, inArray, lte, ne } from "drizzle-orm";

type CreateActivityParams = {
  organizationId: string;
  userId?: string;
  type: (typeof activityTypeEnum.enumValues)[number];
  source: "system" | "user";
  status?: (typeof activityStatusEnum.enumValues)[number];
  priority?: number;
  groupId?: string;
  metadata: Record<string, any>;
};

export async function createActivity(
  db: DBClient,
  params: CreateActivityParams,
) {
  const [result] = await db
    .insert(activity_table)
    .values({
      organizationId: params.organizationId,
      userId: params.userId,
      type: params.type,
      source: params.source,
      status: params.status,
      priority: params.priority ?? 5,
      groupId: params.groupId,
      metadata: params.metadata,
    })
    .returning();

  return result;
}

export async function updateActivityStatus(
  db: DBClient,
  activityId: string,
  status: (typeof activityStatusEnum.enumValues)[number],
  organizationId: string,
) {
  const [result] = await db
    .update(activity_table)
    .set({ status })
    .where(
      and(
        eq(activity_table.id, activityId),
        eq(activity_table.organizationId, organizationId),
      ),
    )
    .returning();

  return result;
}

export async function updateAllActivitiesStatus(
  db: DBClient,
  organizationId: string,
  status: (typeof activityStatusEnum.enumValues)[number],
  options: { userId: string },
) {
  const conditions = [
    eq(activity_table.organizationId, organizationId),
    eq(activity_table.userId, options.userId),
  ];

  // Only update specific statuses based on the target status
  if (status === "archived") {
    // When archiving, update unread and read notifications
    conditions.push(inArray(activity_table.status, ["unread", "read"]));
  } else if (status === "read") {
    // When marking as read, only update unread notifications (never archived)
    conditions.push(eq(activity_table.status, "unread"));
  } else {
    // For other statuses, use the original logic but exclude archived
    conditions.push(ne(activity_table.status, status));
    conditions.push(ne(activity_table.status, "archived"));
  }

  const result = await db
    .update(activity_table)
    .set({ status })
    .where(and(...conditions))
    .returning();

  return result;
}

export type GetActivitiesParams = {
  organizationId: string;
  cursor?: string | null;
  pageSize?: number;
  status?:
    | (typeof activityStatusEnum.enumValues)[number][]
    | (typeof activityStatusEnum.enumValues)[number]
    | null;
  userId?: string | null;
  priority?: number | null;
  maxPriority?: number | null; // For filtering notifications (priority <= 3)
};

export async function getActivities(db: DBClient, params: GetActivitiesParams) {
  const {
    organizationId,
    cursor,
    pageSize = 20,
    status,
    userId,
    priority,
    maxPriority,
  } = params;

  // Convert cursor to offset
  const offset = cursor ? Number.parseInt(cursor, 10) : 0;

  // Base conditions for the WHERE clause
  const whereConditions: SQL[] = [
    eq(activity_table.organizationId, organizationId),
  ];

  // Filter by status - support both single status and array of statuses
  if (status) {
    if (Array.isArray(status)) {
      whereConditions.push(inArray(activity_table.status, status));
    } else {
      whereConditions.push(eq(activity_table.status, status));
    }
  }

  // Filter by user if specified
  if (userId) {
    whereConditions.push(eq(activity_table.userId, userId));
  }

  // Filter by priority if specified
  if (priority) {
    whereConditions.push(eq(activity_table.priority, priority));
  }

  // Filter by max priority if specified (for notifications: priority <= 3)
  if (maxPriority) {
    whereConditions.push(lte(activity_table.priority, maxPriority));
  }

  // Execute the query with proper ordering and pagination
  const data = await db
    .select()
    .from(activity_table)
    .where(and(...whereConditions))
    .orderBy(desc(activity_table.createdAt)) // Most recent first
    .limit(pageSize)
    .offset(offset);

  // Calculate next cursor
  const nextCursor =
    data && data.length === pageSize
      ? (offset + pageSize).toString()
      : undefined;

  return {
    meta: {
      cursor: nextCursor ?? null,
      hasPreviousPage: offset > 0,
      hasNextPage: data && data.length === pageSize,
    },
    data,
  };
}
