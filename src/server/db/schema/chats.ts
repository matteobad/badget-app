import type { UIChatMessage } from "~/server/domain/ai/types";
import { index } from "drizzle-orm/pg-core";

import { pgTable } from "./_table";
import { organization, user } from "./auth";

export const chat_table = pgTable(
  "chat_table",
  (d) => ({
    id: d.text().primaryKey(), // nanoid

    organizationId: d
      .uuid()
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    userId: d
      .uuid()
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    title: d.text(),
    createdAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
  }),
  (t) => [
    index("chats_organization_id_idx").on(t.organizationId),
    index("chats_user_id_idx").on(t.userId),
    index("chats_updated_at_idx").on(t.updatedAt),
  ],
);

export const chat_message_table = pgTable(
  "chat_message_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    chatId: d
      .text()
      .notNull()
      .references(() => chat_table.id, {
        onDelete: "cascade",
      }),
    organizationId: d
      .uuid()
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    userId: d
      .uuid()
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    content: d.jsonb().$type<UIChatMessage>().notNull(), // Store individual message as JSONB
    createdAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
  }),
  (t) => [
    index("chat_messages_chat_id_idx").on(t.chatId),
    index("chat_messages_organization_id_idx").on(t.organizationId),
    index("chat_messages_user_id_idx").on(t.userId),
    index("chat_messages_created_at_idx").on(t.createdAt),
  ],
);

export const chat_feedback_table = pgTable(
  "chat_feedback_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    chatId: d
      .text()
      .notNull()
      .references(() => chat_table.id, {
        onDelete: "cascade",
      }),
    messageId: d.text().notNull(), // Client-side message ID from AI SDK
    organizationId: d
      .uuid()
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    userId: d
      .uuid()
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    type: d.text().notNull(), // "positive", "negative", "other"
    comment: d.text(), // Optional comment
    createdAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
  }),
  (t) => [
    index("chat_feedback_chat_id_idx").on(t.chatId),
    index("chat_feedback_message_id_idx").on(t.messageId),
    index("chat_feedback_organization_id_idx").on(t.organizationId),
    index("chat_feedback_user_id_idx").on(t.userId),
    index("chat_feedback_type_idx").on(t.type),
    index("chat_feedback_created_at_idx").on(t.createdAt),
  ],
);
