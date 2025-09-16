import {
  deleteDocumentTag,
  getDocumentTags,
} from "~/server/domain/documents/document-tag-queries";
import { deleteDocumentTagSchema } from "~/shared/validators/document-tag.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const documentTagsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx: { db, orgId } }) => {
    return getDocumentTags(db, orgId!);
  }),

  //   create: protectedProcedure
  //     .input(createDocumentTagSchema)
  //     .mutation(async ({ ctx: { db, orgId }, input }) => {
  //       const data = await createDocumentTag(db, {
  //         organizationId: orgId!,
  //         name: input.name,
  //         slug: slugify(input.name),
  //       });

  //       // If a tag is created, we need to embed it
  //       if (data) {
  //         const embedService = new Embed();
  //         const { embedding, model } = await embedService.embed(input.name);

  //         await createDocumentTagEmbedding(db, {
  //           slug: data.slug,
  //           name: input.name,
  //           embedding: JSON.stringify(embedding),
  //           model,
  //         });
  //       }

  //       return data;
  //     }),

  delete: protectedProcedure
    .input(deleteDocumentTagSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return deleteDocumentTag(db, {
        id: input.id,
        organizationId: orgId!,
      });
    }),
});
