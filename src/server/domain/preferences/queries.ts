import type { DBClient } from "~/server/db";
import { user_preferences_table } from "~/server/db/schema/preferences";
import { INITIAL_WIDGETS } from "~/shared/constants/widgets";
import { and, eq, sql } from "drizzle-orm";

export type Widget = {
  id: string;
  settings?: { period?: string };
};

export type GetUserWidgetsParams = {
  userId: string;
  organizationId: string;
};

export async function getUserWidgetsQuery(
  db: DBClient,
  params: GetUserWidgetsParams,
) {
  const { userId, organizationId } = params;

  const [result] = await db
    .select({
      widgets: sql<Widget[]>`${user_preferences_table.widgets}`,
    })
    .from(user_preferences_table)
    .where(
      and(
        eq(user_preferences_table.userId, userId),
        eq(user_preferences_table.organizationId, organizationId),
      ),
    );

  return result?.widgets ?? INITIAL_WIDGETS;
}

export type UpdateUserWidgetsParams = {
  userId: string;
  organizationId: string;
  widgets: Widget[];
};

export async function updateUserWidgetsMutation(
  db: DBClient,
  params: UpdateUserWidgetsParams,
) {
  const { userId, organizationId, widgets } = params;

  const result = await db
    .insert(user_preferences_table)
    .values({
      userId,
      organizationId,
      widgets,
    })
    .onConflictDoUpdate({
      target: [
        user_preferences_table.organizationId,
        user_preferences_table.userId,
      ],
      set: { widgets },
    })
    .returning({
      widgets: sql<Widget[]>`${user_preferences_table.widgets}`,
    });

  return result;
}

export type UpdateUserWidgetParams = {
  userId: string;
  organizationId: string;
  widget: Widget;
};

export async function updateUserWidgetMutation(
  db: DBClient,
  params: UpdateUserWidgetParams,
) {
  const { userId, organizationId, widget } = params;

  // 1. leggi preferenze attuali
  const [record] = await db
    .select({ widgets: sql<Widget[]>`${user_preferences_table.widgets}` })
    .from(user_preferences_table)
    .where(
      and(
        eq(user_preferences_table.userId, userId),
        eq(user_preferences_table.organizationId, organizationId),
      ),
    );

  if (!record) throw new Error("Preferences not found");

  // 2. aggiorna in memoria
  const updated = record.widgets.map((w) =>
    w.id === widget.id
      ? { ...w, settings: { ...w.settings, ...widget.settings } }
      : w,
  );

  // 3. salva di nuovo
  await db
    .update(user_preferences_table)
    .set({ widgets: updated })
    .where(
      and(
        eq(user_preferences_table.userId, userId),
        eq(user_preferences_table.organizationId, organizationId),
      ),
    );
}
