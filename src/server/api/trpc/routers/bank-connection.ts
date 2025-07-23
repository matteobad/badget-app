import { tasks } from "@trigger.dev/sdk/v3";
import { TRPCError } from "@trpc/server";
import { getBankAccountProvider } from "~/features/account/server/providers";
import { type deleteConnection } from "~/server/jobs/tasks/delete-connection";
import { type initialBankSetup } from "~/server/jobs/tasks/initial-bank-setup";
import {
  createBankConnection,
  deleteBankConnection,
  getBankConnections,
} from "~/server/services/bank-connection-service";
import {
  createBankConnectionSchema,
  deleteBankConnectionSchema,
  getBankConnectionsSchema,
  getOpenBankingAccountsSchema,
} from "~/shared/validators/bank-connection.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const bankConnectionRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getBankConnectionsSchema)
    .query(async ({ input, ctx: { session } }) => {
      return getBankConnections(input, session!.userId);
    }),

  getAccounts: protectedProcedure
    .input(getOpenBankingAccountsSchema)
    .query(async ({ input }) => {
      const provider = getBankAccountProvider("gocardless");
      return await provider.getAccounts({ id: input.id });
    }),

  create: protectedProcedure
    .input(createBankConnectionSchema)
    .mutation(async ({ input, ctx: { session } }) => {
      const data = await createBankConnection(input, session!.userId);

      if (!data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Bank connection not found",
        });
      }

      const event = await tasks.trigger<typeof initialBankSetup>(
        "initial-bank-setup",
        {
          connectionId: data.id,
          userId: session!.userId,
        },
      );

      return event;
    }),

  delete: protectedProcedure
    .input(deleteBankConnectionSchema)
    .mutation(async ({ input, ctx: { session } }) => {
      const userId = session!.userId;
      const data = await deleteBankConnection(input, userId);

      if (!data) {
        throw new Error("Bank connection not found");
      }

      await tasks.trigger<typeof deleteConnection>("delete-connection", {
        referenceId: data.referenceId!,
        provider: data.provider,
      });

      return data;
    }),
});
