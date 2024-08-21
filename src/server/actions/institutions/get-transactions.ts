"use server";

import { kv } from "@vercel/kv";

import { env } from "~/env";
import { GoCardLessApi } from "~/server/providers/gocardless/gocardless-api";

type GetTransactionParams = {
  bankAccountId: string;
  latest: boolean;
};

const api = new GoCardLessApi({
  kv: kv,
  envs: {
    GOCARDLESS_SECRET_ID: env.GOCARDLESS_SECRET_ID,
    GOCARDLESS_SECRET_KEY: env.GOCARDLESS_SECRET_KEY,
  },
});

export async function getTransactions({
  bankAccountId,
  latest,
}: GetTransactionParams) {
  const data = await api.getTransactions({
    accountId: bankAccountId,
    latest,
  });

  return (
    data?.sort(
      (a, b) =>
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(),
    ) ?? []
  );
}
