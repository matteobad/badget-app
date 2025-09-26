import type { DBClient } from "~/server/db";
import { chat_feedback_table } from "~/server/db/schema/chats";

export const createChatFeedback = async (
  db: DBClient,
  data: {
    chatId: string;
    messageId: string;
    organizationId: string;
    userId: string;
    type: "positive" | "negative" | "other";
    comment?: string;
  },
) => {
  const [newFeedback] = await db
    .insert(chat_feedback_table)
    .values({
      chatId: data.chatId,
      messageId: data.messageId,
      organizationId: data.organizationId,
      userId: data.userId,
      type: data.type,
      comment: data.comment,
    })
    .returning();

  return newFeedback;
};
