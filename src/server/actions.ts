"use server";

import { revalidateTag } from "next/cache";

import { authActionClient } from "~/lib/safe-action";
import { ToggleAccountSchema } from "~/lib/validators";
import { MUTATIONS } from "~/server/db/queries";

export const toggleAccountAction = authActionClient
  .schema(ToggleAccountSchema)
  .metadata({ actionName: "toggle-account" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await MUTATIONS.toggleAccount({ ...parsedInput, userId: ctx.userId });

    // Invalidate cache
    revalidateTag(`connection_${ctx.userId}`);
    revalidateTag(`account_${ctx.userId}`);

    // Return success message
    return { message: "Account toggled" };
  });
