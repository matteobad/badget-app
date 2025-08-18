"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "~/shared/helpers/better-auth/auth-client";
import { Loader2 } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function PasswordSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
          <Link href="#" className="ml-auto inline-block text-sm underline">
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
          await signIn.email(
            {
              email,
              password,
              callbackURL: "/overview",
            },
            {
              onRequest: (_ctx) => {
                setLoading(true);
              },
              onResponse: (_ctx) => {
                setLoading(false);
              },
            },
          );
        }}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <p> Login </p>
        )}
      </Button>
    </div>
  );
}
