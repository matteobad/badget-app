import "~/styles/globals.css";

import { type ReactElement } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "~/components/ui/sonner";
import { I18nProviderClient } from "~/locales/client";
import { TailwindIndicator } from "../../components/tailwind-indicator";
import { ThemeProvider } from "../../components/theme-provider";

export const metadata = {
  title: "Badget.",
  description: "Personal finance for everyone",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: ReactElement;
}) {
  const { locale } = await params;

  return (
    <ClerkProvider afterSignOutUrl={"/sign-in"} dynamic>
      <html
        lang="en"
        className={`${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning
      >
        <body>
          <I18nProviderClient locale={locale}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <NuqsAdapter>{children}</NuqsAdapter>
              <TailwindIndicator />
            </ThemeProvider>
          </I18nProviderClient>
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
