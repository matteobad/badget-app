import { kv } from "@vercel/kv";

import { env } from "~/env";
import { Provider } from "../db/schema/enum";
import { GoCardLessApi } from "../providers/gocardless/gocardless-api";

export async function getGoCardLessInstitutions() {
  const provider = new GoCardLessApi({
    kv: kv,
    envs: {
      GOCARDLESS_SECRET_ID: env.GOCARDLESS_SECRET_ID,
      GOCARDLESS_SECRET_KEY: env.GOCARDLESS_SECRET_KEY,
    },
  });

  const data = await provider.getInstitutions({ countryCode: "IT" });

  return data.map((institution) => {
    return {
      id: institution.id,
      name: institution.name,
      logo: institution.logo,
      countries: institution.countries,
      available_history: +institution.transaction_total_days,
      popularity: 0,
      provider: Provider.GOCARDLESS,
    };
  });
}

export async function getInstitutions() {
  const data = await Promise.all([getGoCardLessInstitutions()]);

  return data.flat();
}
