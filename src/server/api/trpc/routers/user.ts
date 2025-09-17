import {
  deleteUser,
  getUserById,
  updateUser,
} from "~/server/services/user-service";
import { updateUserSchema } from "~/shared/validators/user.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx: { db, session } }) => {
    const userId = session!.userId;
    return getUserById(db, userId);
  }),

  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ input }) => {
      return await updateUser(input);
    }),

  delete: protectedProcedure.mutation(async () => {
    return await deleteUser();
  }),
});
