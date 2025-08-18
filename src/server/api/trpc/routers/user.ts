import { getUserById, updateUser } from "~/server/services/user-service";
import { updateUserSchema } from "~/shared/validators/user.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx: { db, session } }) => {
    const userId = session!.userId;
    return getUserById(db, userId);
  }),

  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx: { db, session }, input }) => {
      const userId = session!.userId;
      return updateUser(db, input, userId);
    }),

  //   delete: protectedProcedure.mutation(
  //     async ({ ctx: { supabase, db, session } }) => {
  //       const [data] = await Promise.all([
  //         deleteUser(db, session.user.id),
  //         supabase.auth.admin.deleteUser(session.user.id),
  //         resend.contacts.remove({
  //           email: session.user.email,
  //           audienceId: process.env.RESEND_AUDIENCE_ID!,
  //         }),
  //       ]);

  //       return data;
  //     },
  //   ),
});
