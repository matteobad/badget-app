import { headers } from "next/headers";
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { z } from "zod/v4";
import { auth } from "~/shared/helpers/better-auth/auth";

// This is our base client.
// Here we define a middleware that logs the result of the action execution.
export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof Error) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
      track: z
        .object({
          event: z.string(),
          channel: z.string(),
        })
        .optional(),
    });
  },
});

export const authActionClient = actionClient
  .use(async ({ next, clientInput, metadata }) => {
    const startTime = performance.now();

    // Here we await the action execution.
    const result = await next();

    const endTime = performance.now();

    console.log("Metadata ->", metadata);
    console.log("Client input ->", clientInput);
    console.log("Result ->", result);
    console.log("Action execution took", endTime - startTime, "ms");

    // And then return the result of the awaited action.
    return result;
  })
  .use(async ({ next }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If the session is not valid, we throw an error and stop execution here.
    if (!session) {
      throw new Error("Session is not valid!");
    }

    if (!session.session.activeOrganizationId) {
      throw new Error("Session is not valid!");
    }

    // Here we return the context object for the next middleware in the chain/server code function.
    return next({
      ctx: {
        userId: session.user.id,
        orgId: session.session.activeOrganizationId,
      },
    });
  });
