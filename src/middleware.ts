import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { createI18nMiddleware } from "next-international/middleware";

import { defaultLocale, locales } from "./shared/locales/config";

const I18nMiddleware = createI18nMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  urlMappingStrategy: "rewriteDefault",
});

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // api routes need to pass through middleware
  // but if passing on i18nMiddleware we get a 404
  if (pathname.includes("api")) {
    return;
  }

  // 1. Not authenticated
  if (!sessionCookie && pathname !== "/sign-in" && pathname !== "/sign-up") {
    const url = new URL("/sign-in", request.url);
    return NextResponse.redirect(url);
  }

  // 2. If authenticated, proceed with other checks
  if (sessionCookie) {
    if (pathname !== "/spaces/create" && pathname !== "/spaces") {
      // Check if the URL contains an invite code
      const inviteCodeMatch = pathname.startsWith("/spaces/invite/");

      if (inviteCodeMatch) {
        const url = new URL("/", request.url);
        // Allow proceeding to invite page even without setup
        // Redirecting with the original path including locale if present
        return NextResponse.redirect(
          `${url.origin}${request.nextUrl.pathname}`,
        );
      }
    }
  }

  return I18nMiddleware(request);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
