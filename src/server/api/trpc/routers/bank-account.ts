import { getBankAccounts } from "~/server/services/bank-account-service";
import { getBankAccountsSchema } from "~/shared/validators/bank-account.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const bankAccountRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getBankAccountsSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.userId;
      return await getBankAccounts(input, userId);
    }),
});
