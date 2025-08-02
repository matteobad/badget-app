import { db } from "~/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, organization, twoFactor, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "sqlite" or "mysql"
  }),
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
    passkey(),
    admin(),
    twoFactor(),
    organization(),
    username(),
    nextCookies(),
  ],
});
