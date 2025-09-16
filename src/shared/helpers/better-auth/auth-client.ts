import {
  adminClient,
  inferAdditionalFields,
  inferOrgAdditionalFields,
  organizationClient,
  passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "./auth";

const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: "http://localhost:3000",
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient(),
    passkeyClient(),
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>(),
    }),
  ],
});

export const {
  signIn,
  signOut,
  signUp,
  forgetPassword,
  resetPassword,
  useSession,
  useActiveOrganization,
  organization,
} = authClient;
