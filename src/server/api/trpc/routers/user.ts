import {
  changeEmail,
  changePassword,
  deleteUser,
  getUserById,
  updateUserInformation,
} from "~/server/services/user-service";
import {
  changeEmailSchema,
  changePasswordSchema,
  updateUserSchema,
} from "~/shared/validators/user.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx: { db, session } }) => {
    const userId = session!.userId;
    return getUserById(db, userId);
  }),

  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx: { headers }, input }) => {
      return await updateUserInformation(headers, input);
    }),

  changeEmail: protectedProcedure
    .input(changeEmailSchema)
    .mutation(async ({ ctx: { headers }, input }) => {
      return await changeEmail(headers, input);
    }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx: { headers }, input }) => {
      return await changePassword(headers, input);
    }),

  delete: protectedProcedure.mutation(async () => {
    return await deleteUser();
  }),
});
