"server-only";

import { db } from "~/server/db";
import { getUserByIdQuery } from "~/server/domain/user/queries";
import { resend } from "~/server/emails/resend";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, organization, twoFactor, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

export const auth = betterAuth({
  advanced: {
    database: {
      generateId: false,
    },
  },
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
    // it sends the reset password token using resend to your email
    sendResetPassword: async ({ user, url }) => {
      const { data, error } = await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: user.email,
        subject: "Reset your password",
        html: `Click the link to reset your password: ${url}`,
      });

      if (error) {
        return console.error({ error });
      }

      console.log("Reset passoword email sent", { data });
    },
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
    organization({
      schema: {
        organization: {
          additionalFields: {
            baseCurrency: {
              type: "string",
              input: true,
              required: false,
            },
            countryCode: {
              type: "string",
              input: true,
              required: false,
            },
            email: {
              type: "string",
              input: true,
              required: false,
            },
          },
        },
      },
    }),
    username(),
    nextCookies(),
  ],
});
