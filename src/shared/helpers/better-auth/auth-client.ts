import { passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: "http://localhost:3000",
  plugins: [passkeyClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
