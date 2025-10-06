import {
  createTag,
  deleteTag,
  getTags,
  updateTag,
} from "~/server/services/tag-service";
import {
  createTagSchema,
  deleteTagSchema,
  getTagsSchema,
  updateTagSchema,
} from "~/shared/validators/tag.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const tagRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getTagsSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return await getTags(db, input, orgId!);
    }),

  create: protectedProcedure
    .input(createTagSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return await createTag(db, input, orgId!);
    }),

  update: protectedProcedure
    .input(updateTagSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return updateTag(db, input, orgId!);
    }),

  delete: protectedProcedure
    .input(deleteTagSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return await deleteTag(db, input, orgId!);
    }),
});
