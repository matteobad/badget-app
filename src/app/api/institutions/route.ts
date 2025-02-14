import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getBankAccountProvider } from "~/lib/providers";

export async function GET(req: NextRequest) {
  try {
    const providerName =
      req.nextUrl.searchParams.get("provider") ?? "gocardless";

    const provider = getBankAccountProvider(providerName);
    const institutions = await provider.getInstitutions({ countryCode: "IT" });

    return NextResponse.json({ institutions });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
