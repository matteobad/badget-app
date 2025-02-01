import { z } from "zod";

export const workspaceParams = z.object({
  userId: z.string().startsWith("userId_").nullable(),
  orgId: z.string().startsWith("orgId_").optional().nullable(),
});
