import {
  deleteChatSchema,
  getChatSchema,
  listChatsSchema,
} from "~/shared/validators/chat.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const chatRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listChatsSchema)
    .query(async ({ ctx, input }) => {
      return getChatsByTeam(
        ctx.db,
        ctx.teamId!,
        ctx.session.user.id,
        input.limit,
        input.search,
      );
    }),

  get: protectedProcedure.input(getChatSchema).query(async ({ ctx, input }) => {
    return getChatById(ctx.db, input.chatId, ctx.teamId!);
  }),

  delete: protectedProcedure
    .input(deleteChatSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteChat(ctx.db, input.chatId, ctx.teamId!);
    }),
});
