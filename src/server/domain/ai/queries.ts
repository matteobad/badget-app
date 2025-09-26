import type { DBClient } from "~/server/db";
import { chat_message_table, chat_table } from "~/server/db/schema/chats";
import { and, desc, eq, ilike } from "drizzle-orm";

import type { UIChatMessage } from "./types";

export const getChatById = async (
  db: DBClient,
  chatId: string,
  organizationId: string,
) => {
  const [chat] = await db
    .select()
    .from(chat_table)
    .where(
      and(
        eq(chat_table.id, chatId),
        eq(chat_table.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!chat) {
    return null;
  }

  // Get all messages for this chat
  const messages = await db
    .select()
    .from(chat_message_table)
    .where(
      and(
        eq(chat_message_table.chatId, chatId),
        eq(chat_message_table.organizationId, organizationId),
      ),
    )
    .orderBy(chat_message_table.createdAt);

  return {
    ...chat,
    messages: messages.map((m: any) => m.content),
  };
};

export const getChatsBySpace = async (
  db: DBClient,
  organizationId: string,
  userId: string,
  limit = 50,
  search?: string,
) => {
  const baseConditions = [
    eq(chat_table.organizationId, organizationId),
    eq(chat_table.userId, userId),
  ];

  if (search) {
    baseConditions.push(ilike(chat_table.title, `%${search}%`));
  }

  return await db
    .select({
      id: chat_table.id,
      title: chat_table.title,
      createdAt: chat_table.createdAt,
      updatedAt: chat_table.updatedAt,
    })
    .from(chat_table)
    .where(and(...baseConditions))
    .orderBy(desc(chat_table.updatedAt))
    .limit(limit);
};

export const saveChat = async (
  db: DBClient,
  data: {
    chatId: string;
    organizationId: string;
    userId: string;
    title?: string | null;
  },
) => {
  const [chat] = await db
    .insert(chat_table)
    .values({
      id: data.chatId,
      organizationId: data.organizationId,
      userId: data.userId,
      title: data.title,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: chat_table.id,
      set: {
        ...(data.title && { title: data.title }),
        updatedAt: new Date(),
      },
    })
    .returning();

  return chat;
};

export const saveChatMessage = async (
  db: DBClient,
  data: {
    chatId: string;
    organizationId: string;
    userId: string;
    message: UIChatMessage;
  },
) => {
  const [message] = await db
    .insert(chat_message_table)
    .values({
      chatId: data.chatId,
      organizationId: data.organizationId,
      userId: data.userId,
      content: data.message,
    })
    .returning();

  return message;
};

export const deleteChat = async (
  db: DBClient,
  chatId: string,
  organizationId: string,
) => {
  await db
    .delete(chat_table)
    .where(
      and(
        eq(chat_table.id, chatId),
        eq(chat_table.organizationId, organizationId),
      ),
    );
};
