"use client";

import { APIError } from "better-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "~/shared/helpers/better-auth/auth-client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";

export function PasswordSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [returnTo] = useQueryState("return_to");
  const router = useRouter();

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          value={email}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="ml-auto inline-block text-sm underline"
          >
            Forgot your password?
          </Link>
        </div>

        <Input
          id="password"
          type="password"
          placeholder="password"
          autoComplete="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
        onClick={async () => {
          try {
            // Call the authClient's forgetPassword method, passing the email and a redirect URL.
            await signIn.email(
              {
                email,
                password,
              },
              {
                onRequest: () => {
                  setLoading(true);
                },
                onResponse: () => {
                  setLoading(false);
                },
                onError: (ctx) => {
                  toast.error(ctx.error.message);
                },
                onSuccess: (ctx) => {
                  if (ctx.data.twoFactorRedirect) router.push("/2fa");
                  else router.push(returnTo ? `/${returnTo}` : "/");
                },
              },
            );
          } catch (error) {
            if (error instanceof APIError) {
              console.log(error.message, error.status);
              toast.error(error.message);
            }
          }
        }}
      >
        {loading ? <Spinner /> : <p> Login </p>}
      </Button>
    </div>
  );
}
