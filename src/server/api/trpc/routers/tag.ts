import { getTags } from "~/server/services/tag-service";
import { getTagsSchema } from "~/shared/validators/tag.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const tagRouter = createTRPCRouter({
  get: protectedProcedure.input(getTagsSchema).query(async ({ ctx, input }) => {
    const userId = ctx.session.userId!;
    return await getTags(input, userId);
  }),
});
