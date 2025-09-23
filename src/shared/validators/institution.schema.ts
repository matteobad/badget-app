import { z } from "@hono/zod-openapi";

export const getInstitutionsSchema = z.object({
  q: z.string().optional(),
  countryCode: z.string(),
});

export const updateInstitutionUsageSchema = z.object({
  id: z.string(),
});
