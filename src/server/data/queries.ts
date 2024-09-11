import "server-only";

import { kv } from "@vercel/kv";

import { env } from "~/env";
import { GoCardLessApi } from "../providers/gocardless/gocardless-api";

export async function getInstitutions() {
  const api = new GoCardLessApi({
    kv: kv,
    envs: {
      GOCARDLESS_SECRET_ID: env.GOCARDLESS_SECRET_ID,
      GOCARDLESS_SECRET_KEY: env.GOCARDLESS_SECRET_KEY,
    },
  });

  return await api.getInstitutions({ countryCode: "IT" });
}
