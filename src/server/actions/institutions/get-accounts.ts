"use server";

import { kv } from "@vercel/kv";

import { env } from "~/env";
import { GoCardLessApi } from "~/server/providers/gocardless/gocardless-api";

type GetAccountParams = {
  id: string;
};

const api = new GoCardLessApi({
  kv: kv,
  envs: {
    GOCARDLESS_SECRET_ID: env.GOCARDLESS_SECRET_ID,
    GOCARDLESS_SECRET_KEY: env.GOCARDLESS_SECRET_KEY,
  },
});

export async function getAccounts({ id }: GetAccountParams) {
  const data = await api.getAccounts({
    id,
  });

  return (
    data
      ?.filter(
        (account) =>
          !account.account.status || account.account.status !== "deleted",
      )
      .sort((a, b) => Number(b.balance?.amount) - Number(a.balance?.amount)) ??
    []
  );
}
