import type { Metadata } from "next";
import React from "react";
import { ForgotPassword } from "~/components/auth/forgot-password";

export const metadata: Metadata = {
  title: "Forgot Password | Badget.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="p-2">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="mb-4 font-serif text-lg">Welcome to Badget.</h1>
        <p className="mb-8 text-sm text-[#878787]">
          Forgot your password? Enter your email to reset it.
        </p>
      </div>

      {/* Sign In Options */}
      <div className="space-y-4">
        <ForgotPassword />
      </div>
    </div>
  );
}
