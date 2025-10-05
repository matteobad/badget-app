import "~/globals.css";

import type { Metadata } from "next";
import { type ReactElement } from "react";
import { Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "~/components/ui/sonner";
import { cn } from "~/lib/utils";
import { TRPCReactProvider } from "~/shared/helpers/trpc/client";
import { I18nProviderClient } from "~/shared/locales/client";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { TailwindIndicator } from "../../components/tailwind-indicator";
import { ThemeProvider } from "../../components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://badget.xyz"),
  title: "Badget",
  description:
    "Automate financial tasks, stay organized, and make informed decisions effortlessly.",
};

const lora = Lora({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
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
    <html
      lang="en"
      className={cn(
        `${GeistSans.variable} ${GeistMono.variable} ${lora.variable} font-sans`,
        "overscroll-none whitespace-pre-line antialiased",
      )}
      suppressHydrationWarning
    >
      <body>
        <TRPCReactProvider>
          <I18nProviderClient locale={locale}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NuqsAdapter>{children}</NuqsAdapter>
              <TailwindIndicator />
              <Toaster />
            </ThemeProvider>
          </I18nProviderClient>
        </TRPCReactProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
