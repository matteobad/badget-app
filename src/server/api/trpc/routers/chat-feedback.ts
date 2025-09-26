import { createChatFeedback } from "~/server/domain/chat-feedback/queries";
import { createChatFeedbackSchema } from "~/shared/validators/chat-feedback.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const chatFeedbackRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createChatFeedbackSchema)
    .mutation(async ({ input, ctx: { db, orgId, session } }) => {
      return createChatFeedback(db, {
        ...input,
        organizationId: orgId!,
        userId: session!.userId,
      });
    }),
});
