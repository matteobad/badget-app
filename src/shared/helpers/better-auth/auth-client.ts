import { passkeyClient } from "@better-auth/passkey/client";
import {
  adminClient,
  inferAdditionalFields,
  inferOrgAdditionalFields,
  organizationClient,
  twoFactorClient,
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
    twoFactorClient(),
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>(),
    }),
  ],
});

export const {
  signIn,
  signOut,
  signUp,
  requestPasswordReset,
  resetPassword,
  useSession,
  useActiveOrganization,
  organization,
  twoFactor,
} = authClient;
