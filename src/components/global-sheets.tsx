"use client";

import { use } from "react";

import { ConnectBankDialog } from "./bank-connection/connect-bank-dialog";
import { SelectBankAccountsModal } from "./bank-connection/select-bank-accounts";
import CreateCategoryDialog from "./category/create-category-dialog";
import CategorySheet from "./category/sheets/category-sheet";
import CreateTransactionSheet from "./transaction/sheets/create-transaction-sheet";
import TransactionSheet from "./transaction/sheets/transaction-sheet";

type Props = {
  //   currencyPromise: Promise<string>;
  countryCodePromise: Promise<string>;
};

export function GlobalSheets({ countryCodePromise }: Props) {
  //   const currency = use(currencyPromise);
  const countryCode = use(countryCodePromise);

  return (
    <>
      <ConnectBankDialog countryCode={countryCode} />
      <SelectBankAccountsModal />

      <CreateCategoryDialog />
      <CategorySheet />

      <CreateTransactionSheet />
      <TransactionSheet />
    </>
  );
}
