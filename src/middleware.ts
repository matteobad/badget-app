import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.nextUrl.origin);
  const pathname = request.nextUrl.pathname;

  const { orgId, userId } = await auth();

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!isPublicRoute(request)) {
    console.log("protect");
    await auth.protect();
  }

  // For users visiting /onboarding, don't try to redirect
  if (userId && isOnboardingRoute(request)) {
    console.log("logged and onboarding");
    return NextResponse.next();
  }

  // Catch users who do not have `onboardingComplete: true` in their publicMetadata
  // Redirect them to the /onboading route to complete onboarding
  // if (userId && !sessionClaims?.metadata?.onboardingComplete) {
  //   const onboardingUrl = new URL("/onboarding", request.url);
  //   return NextResponse.redirect(onboardingUrl);
  // }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
