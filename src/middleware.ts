import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { createI18nMiddleware } from "next-international/middleware";

import { defaultLocale, locales } from "./locales/config";

const I18nMiddleware = createI18nMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  urlMappingStrategy: "rewriteDefault",
});

const isUploadthingRoute = createRouteMatcher(["/api/uploadthing(.*)"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // uploadthing needs to pass through clerkMiddleware
  // but if passing on i18nMiddleware we get a 404
  if (isUploadthingRoute(request)) return;

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  return I18nMiddleware(request);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
