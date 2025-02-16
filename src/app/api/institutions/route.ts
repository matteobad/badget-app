import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getBankAccountProvider } from "~/lib/providers";
import { db } from "~/server/db";
import { institution_table as institutionSchema } from "~/server/db/schema/open-banking";

export async function GET(req: NextRequest) {
  try {
    const providerName =
      req.nextUrl.searchParams.get("provider") ?? "gocardless";

    const provider = getBankAccountProvider(providerName);
    const institutions = await provider.getInstitutions({ countryCode: "IT" });
    const inserted = await db
      .insert(institutionSchema)
      .values(institutions)
      .returning();

    return NextResponse.json({ institutions: inserted });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
