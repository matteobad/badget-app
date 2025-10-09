import { RocketIcon } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import backgroundLight from "public/assets/bg-login.jpg";
import backgroundDark from "public/assets/bg-login-dark.jpg";
import type { PropsWithChildren } from "react";
import { ConsentBanner } from "~/components/consent-banner";
import { isEU } from "~/server/services/location-service";
import { Cookies } from "~/shared/constants/cookies";

export const metadata: Metadata = {
  title: "Login | Badget.",
};

export default async function Layout({ children }: PropsWithChildren) {
  const cookieStore = await cookies();
  const showTrackingConsent =
    (await isEU()) && !cookieStore.has(Cookies.TrackingConsent);

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
              {children}

              {/* Terms and Privacy */}
              <div className="absolute right-0 bottom-4 left-0 text-center">
                <p className="font-mono text-xs leading-relaxed text-[#878787]">
                  By signing in you agree to our{" "}
                  <Link href="/terms" className="underline">
                    Terms of service
                  </Link>{" "}
                  &{" "}
                  <Link href="/policy" className="underline">
                    Privacy policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Banner */}
      {showTrackingConsent && <ConsentBanner />}
    </div>
  );
}
