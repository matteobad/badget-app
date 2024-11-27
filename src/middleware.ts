import { NextResponse } from "next/server";
import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.nextUrl.origin);
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split("/").filter(Boolean);

  const client = await clerkClient();
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

  if (pathname === "/dashboard") {
    // /dashboard should redirect to the user's dashboard
    // use their current workspace, i.e. /:orgId or /:userId
    url.pathname = `/${orgId ?? userId}`;
    console.log("is dashboard");
    return NextResponse.redirect(url);
  }

  const workspaceId = parts[0];
  const isOrg = workspaceId?.startsWith("org_");
  if (isOrg && orgId !== workspaceId) {
    // User is accessing an org that's not their active one
    // Check if they have access to it
    const orgs = await client.users.getOrganizationMembershipList({
      userId: userId!,
    });
    const hasAccess = orgs.data.some((org) => org.id === workspaceId);
    if (!hasAccess) {
      url.pathname = `/`;
      console.log("isOrg and not access");
      return NextResponse.redirect(url);
    }

    // User has access to the org, let them pass.
    // TODO: Set the active org to the one they're accessing
    // so that we don't need to do this client-side.
    // This is currently not possible with Clerk but will be.
    return NextResponse.next();
  }

  const isUser = workspaceId?.startsWith("user_");
  if (isUser && userId !== workspaceId) {
    // User is accessing a user that's not them
    url.pathname = `/`;
    console.log("isUser and not access");
    return NextResponse.redirect(url);
  }

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
