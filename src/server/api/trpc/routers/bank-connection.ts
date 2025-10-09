import { tasks } from "@trigger.dev/sdk";
import { TRPCError } from "@trpc/server";
import { getBankAccountProvider } from "~/server/integrations/open-banking";
import type { deleteConnection } from "~/server/jobs/tasks/delete-connection";
import type { initialBankSetup } from "~/server/jobs/tasks/initial-bank-setup";
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
    .query(async ({ input, ctx }) => {
      const orgId = ctx.orgId!;
      return getBankConnections(input, orgId);
    }),

  getAccounts: protectedProcedure
    .input(getOpenBankingAccountsSchema)
    .query(async ({ input }) => {
      const provider = getBankAccountProvider("gocardless");
      return await provider.getAccounts({ id: input.id });
    }),

  create: protectedProcedure
    .input(createBankConnectionSchema)
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.orgId!;
      const data = await createBankConnection(input, orgId);

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
          orgId: orgId,
        },
      );

      return event;
    }),

  delete: protectedProcedure
    .input(deleteBankConnectionSchema)
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.orgId!;
      const data = await deleteBankConnection(input, orgId);

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
