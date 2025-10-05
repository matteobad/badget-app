import type { Metadata } from "next";
import type { ReactElement } from "react";
import { Header } from "~/components/home/header";

const baseUrl = "https://badget.xyz/";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Badget | Run your finances smarter",
    template: "%s | Badget",
  },
  description:
    "Badget is a personal finance app that helps you effortlessly track expenses, manage budgets, set savings goals, and gain clear insights into your financial life.",
  openGraph: {
    title: "Badget | Run your finances smarter",
    description:
      "Badget is a personal finance app that helps you effortlessly track expenses, manage budgets, set savings goals, and gain clear insights into your financial life.",
    url: baseUrl,
    siteName:
      "Badget is a personal finance app that helps you effortlessly track expenses, manage budgets, set savings goals, and gain clear insights into your financial life.",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://cdn.midday.ai/opengraph-image.jpg",
        width: 800,
        height: 600,
      },
      {
        url: "https://cdn.midday.ai/opengraph-image.jpg",
        width: 1800,
        height: 1600,
      },
    ],
  },
  twitter: {
    title: "Badget | Run your finances smarter",
    description:
      "Badget is a personal finance app that helps you effortlessly track expenses, manage budgets, set savings goals, and gain clear insights into your financial life.",
    images: [
      {
        url: "https://cdn.midday.ai/opengraph-image.jpg",
        width: 800,
        height: 600,
      },
      {
        url: "https://cdn.midday.ai/opengraph-image.jpg",
        width: 1800,
        height: 1600,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
};

export default function Layout({ children }: { children: ReactElement }) {
  return (
    <>
      <Header />
      <main className="container mx-auto overflow-hidden px-4 md:overflow-visible">
        {children}
      </main>
    </>
  );
}
