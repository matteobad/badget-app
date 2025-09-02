import { z } from "@hono/zod-openapi";

export const getAssetsSchema = z
  .object({
    q: z.string().nullable().optional(),
  })
  .optional();
