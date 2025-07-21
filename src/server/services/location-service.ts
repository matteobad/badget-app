"server-only";

import { headers } from "next/headers";

export async function getCountryCode() {
  const headersList = await headers();

  return headersList.get("x-vercel-ip-country") ?? "IT";
}
