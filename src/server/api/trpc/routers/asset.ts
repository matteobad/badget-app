import { getAssets } from "~/server/services/asset-service";
import { getAssetsSchema } from "~/shared/validators/asset.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const assetRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getAssetsSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return await getAssets(db, input, orgId!);
    }),
});
