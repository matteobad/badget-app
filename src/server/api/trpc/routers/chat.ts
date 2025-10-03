import {
  deleteChat,
  getChatById,
  getChatsBySpace,
} from "~/server/domain/chat/queries";
import {
  deleteChatSchema,
  getChatSchema,
  listChatsSchema,
} from "~/shared/validators/chat.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const chatRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listChatsSchema)
    .query(async ({ ctx: { db, orgId, session }, input }) => {
      return getChatsBySpace(
        db,
        orgId!,
        session!.userId,
        input.limit,
        input.search,
      );
    }),

  get: protectedProcedure
    .input(getChatSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getChatById(db, input.chatId, orgId!);
    }),

  delete: protectedProcedure
    .input(deleteChatSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return deleteChat(db, input.chatId, orgId!);
    }),
});
