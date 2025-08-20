import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignUp } from "~/components/auth/sign-up";
import { RocketIcon } from "lucide-react";
import backgroundDark from "public/assets/bg-login-dark.jpg";
import backgroundLight from "public/assets/bg-login.jpg";

export const metadata: Metadata = {
  title: "Login | Badget.",
};

export default function SignUpPage() {
  const preferredSignInOption = <SignUp />;

  return (
    <div className="h-screen p-2">
      {/* Header - Logo */}
      <header className="absolute top-0 left-0 z-30 w-full">
        <div className="p-6 md:p-8">
          <RocketIcon className="h-8 w-auto" />
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-full">
        {/* Background Image Section - Hidden on mobile, visible on desktop */}
        <div className="relative hidden lg:flex lg:w-1/2">
          <Image
            src={backgroundLight}
            alt="Background"
            className="object-cover dark:hidden"
            priority
            fill
          />
          <Image
            src={backgroundDark}
            alt="Background"
            className="hidden object-cover dark:block"
            priority
            fill
          />
        </div>

        {/* Login Form Section */}
        <div className="relative w-full lg:w-1/2">
          {/* Form Content */}
          <div className="relative z-10 flex h-full items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
              {/* Welcome Section */}
              <div className="text-center">
                <h1 className="mb-4 font-serif text-lg">Welcome to Badget.</h1>
                <p className="mb-8 text-sm text-[#878787]">
                  New here? Register an account to continue
                </p>
              </div>

              {/* Sign In Options */}
              <div className="space-y-4">
                {/* Primary Sign In Option */}
                <div className="space-y-3">{preferredSignInOption}</div>
                <div className="flex items-center justify-center">
                  <span className="text-sm text-[#878787]">Or</span>
                </div>
                {/* Sign-in Options */}
                <Link
                  href="/sign-in"
                  className="ml-auto inline-block w-full text-center text-sm underline"
                >
                  Go to Sign-in
                </Link>
              </div>

              {/* Terms and Privacy */}
              <div className="absolute right-0 bottom-4 left-0 text-center">
                <p className="font-mono text-xs leading-relaxed text-[#878787]">
                  By signing in you agree to our{" "}
                  <Link href="https://midday.ai/terms" className="underline">
                    Terms of service
                  </Link>{" "}
                  &{" "}
                  <Link href="https://midday.ai/policy" className="underline">
                    Privacy policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Banner */}
      {/* {showTrackingConsent && <ConsentBanner />} */}
    </div>
  );
}
