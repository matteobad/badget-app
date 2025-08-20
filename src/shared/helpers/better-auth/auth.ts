"server-only";

import { db } from "~/server/db";
import { getUserByIdQuery } from "~/server/domain/user/queries";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, organization, twoFactor, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

export const auth = betterAuth({
  user: {
    additionalFields: {
      defaultOrganizationId: {
        type: "string",
        required: true,
        defaultValue: "",
        input: true,
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg", // or "sqlite" or "mysql"
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await getUserByIdQuery(db, session.userId);

          if (!user) throw new Error("User not found on DB");

          return {
            data: {
              ...session,
              activeOrganizationId: user.defaultOrganizationId,
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  // emailVerification: {
  //   sendVerificationEmail: async ({ user, url }) => {
  //     // implement your logic here to send email verification
  //     console.log(user, url);
  //   },
  // },
  plugins: [
    admin(),
    passkey(),
    twoFactor(),
    organization(),
    username(),
    nextCookies(),
  ],
});
