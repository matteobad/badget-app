"use client";

import { KeyIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "~/shared/helpers/better-auth/auth-client";

import { Button } from "../ui/button";

export function PasskeySignIn() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      disabled={loading}
      className="w-full"
      onClick={async () => {
        await signIn.passkey({
          // email: "example@gmail.com", // required
          autoFill: true,
          fetchOptions: {
            onRequest: (_ctx) => {
              setLoading(true);
            },
            onResponse: (_ctx) => {
              setLoading(false);
            },
            onSuccess: () => {
              router.push("/overview"); // redirect to login page
            },
          },
        });
      }}
    >
      <KeyIcon size={16} />
      Sign-in with Passkey
    </Button>
  );
}
