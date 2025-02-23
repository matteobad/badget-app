import { z } from "zod";

import { Provider } from "~/server/db/schema/enum";

export const ConnectGocardlessSchema = z.object({
  institutionId: z.string(),
  countryCode: z.string().default("IT"),
  provider: z.nativeEnum(Provider),
  redirectBase: z.string().url(),
});
