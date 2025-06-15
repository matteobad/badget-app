import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { getBankAccountProvider } from "~/features/account/server/providers";
import { db } from "~/server/db";
import { institution_table as institutionSchema } from "~/server/db/schema/open-banking";
import { buildConflictUpdateColumns } from "~/server/db/utils";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const providerName =
      request.nextUrl.searchParams.get("provider") ?? "gocardless";

    const provider = getBankAccountProvider(providerName);
    const institutions = await provider.getInstitutions({ countryCode: "IT" });
    const inserted = await db
      .insert(institutionSchema)
      .values(institutions)
      .onConflictDoUpdate({
        target: [institutionSchema.originalId],
        set: buildConflictUpdateColumns(institutionSchema, [
          "countries",
          "logo",
        ]),
      })
      .returning();

    return NextResponse.json({ institutions: inserted });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
