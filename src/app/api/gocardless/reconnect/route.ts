import { addDays } from "date-fns";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { connection_table } from "~/server/db/schema/open-banking";
import { auth } from "~/shared/helpers/better-auth/auth";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.redirect(new URL("/", req.url));

  const requestUrl = new URL(req.url);
  const id = requestUrl.searchParams.get("id");
  const referenceId = requestUrl.searchParams.get("reference_id") ?? undefined;

  if (id) {
    await db
      .update(connection_table)
      .set({
        // TODO: manage real days
        expiresAt: addDays(new Date(), 90).toDateString(),
        referenceId: referenceId,
      })
      .where(eq(connection_table.id, id));
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/settings/accounts?id=${id}&step=reconnect`,
  );
}
