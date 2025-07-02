import { createTag, deleteTag, getTags } from "~/server/services/tag-service";
import {
  createTagSchema,
  deleteTagSchema,
  getTagsSchema,
} from "~/shared/validators/tag.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const tagRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTagSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await createTag(input, userId);
    }),

  delete: protectedProcedure
    .input(deleteTagSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await deleteTag(input, userId);
    }),

  get: protectedProcedure.input(getTagsSchema).query(async ({ ctx, input }) => {
    const userId = ctx.session.userId!;
    return await getTags(input, userId);
  }),
});
