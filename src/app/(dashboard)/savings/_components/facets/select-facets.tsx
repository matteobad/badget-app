"use client";

import { type GetPensionAccountsReturnType } from "~/lib/data";

export function SelectFacets({
  dateOptions,
  accountOptions,
  defaultDate,
  defaultAccounts,
}: {
  dateOptions: Date[];
  accountOptions: Awaited<GetPensionAccountsReturnType>;
  defaultDate: Date;
  defaultAccounts: number[];
}) {
  return <>Facets {defaultDate}</>;
}
