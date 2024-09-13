import { NextResponse } from "next/server";
import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }

  // get user private metadata
  const user = await clerkClient().users.getUser(auth().userId!);
  const privateMetadata = user?.privateMetadata as {
    bankingCompleted: boolean;
    savingsCompleted: boolean;
    pensionCompleted: boolean;
  };

  // Use default false values if metadata is not yet set
  const bankingCompleted = privateMetadata.bankingCompleted || false;
  const savingsCompleted = privateMetadata.savingsCompleted || false;
  const pensionCompleted = privateMetadata.pensionCompleted || false;

  // redirect to onboarding if not completed
  if (request.nextUrl.pathname.startsWith("/banking") && !bankingCompleted) {
    return NextResponse.redirect(
      new URL("/onboarding?step=banking", request.url),
    );
  }
  if (request.nextUrl.pathname.startsWith("/savings") && !savingsCompleted) {
    return NextResponse.redirect(
      new URL("/onboarding?step=savings", request.url),
    );
  }
  if (request.nextUrl.pathname.startsWith("/pension") && !pensionCompleted) {
    return NextResponse.redirect(
      new URL("/onboarding?step=pension", request.url),
    );
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
