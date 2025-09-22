import {
  createTag,
  deleteTag,
  getTags,
  updateTag,
} from "~/server/services/tag-service";
import {
  createTagSchema,
  deleteTagSchema,
  updateTagSchema,
} from "~/shared/validators/tag.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const tagRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx: { db, orgId } }) => {
    return await getTags(db, orgId!);
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
