import { z } from "@hono/zod-openapi";
import { BANK_PROVIDER } from "~/server/db/schema/enum";

export const getBankAccountsSchema = z.object({
  id: z
    .string()
    .optional()
    .openapi({
      description: "GoCardLess reference id",
      param: {
        name: "id",
        in: "query",
      },
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    }),
  provider: z
    .enum(BANK_PROVIDER)
    .openapi({
      example: BANK_PROVIDER.GOCARDLESS,
    })
    .optional(),
  institutionId: z
    .string()
    .optional()
    .openapi({
      description: "GoCardLess institution id",
      param: {
        name: "institutionId",
        in: "query",
      },
      example: "ins_109508",
    }),
  enabled: z.boolean().optional(),
  manual: z.boolean().optional(),
});
