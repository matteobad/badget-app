import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";

import { defaultLocale, locales } from "./shared/locales/config";

const I18nMiddleware = createI18nMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  urlMappingStrategy: "rewrite",
});

export async function middleware(request: NextRequest) {
  const response = I18nMiddleware(request);
  const sessionCookie = getSessionCookie(request);
  const nextUrl = request.nextUrl;
  const pathnameLocale = nextUrl.pathname.split("/", 2)?.[1];

  // Remove the locale from the pathname
  const pathnameWithoutLocale = pathnameLocale
    ? nextUrl.pathname.slice(pathnameLocale.length + 1)
    : nextUrl.pathname;

  // Create a new URL without the locale in the pathname
  const newUrl = new URL(pathnameWithoutLocale || "/", request.url);

  const encodedSearchParams = `${newUrl?.pathname?.substring(1)}${
    newUrl.search
  }`;

  // 1. Not authenticated
  if (
    !sessionCookie &&
    newUrl.pathname !== "/" &&
    newUrl.pathname !== "/sign-in" &&
    newUrl.pathname !== "/sign-up" &&
    newUrl.pathname !== "/privacy" &&
    newUrl.pathname !== "/terms"
  ) {
    const url = new URL("/sign-in", request.url);

    if (encodedSearchParams) {
      url.searchParams.append("return_to", encodedSearchParams);
    }

    return NextResponse.redirect(url);
  }

  // 2. If authenticated, proceed with other checks
  if (sessionCookie) {
    if (newUrl.pathname !== "/spaces/create" && newUrl.pathname !== "/spaces") {
      // Check if the URL contains an invite code
      const inviteCodeMatch = newUrl.pathname.startsWith("/spaces/invite/");

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

  // If all checks pass, return the original or updated response
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
