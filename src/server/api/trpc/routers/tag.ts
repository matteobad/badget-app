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
      const orgId = ctx.orgId!;
      return await createTag(input, orgId);
    }),

  delete: protectedProcedure
    .input(deleteTagSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await deleteTag(input, orgId);
    }),

  get: protectedProcedure.input(getTagsSchema).query(async ({ ctx, input }) => {
    const orgId = ctx.orgId!;
    return await getTags(input, orgId);
  }),
});
