"use client";

import { use } from "react";

import { BankAccountSheet } from "./bank-account/sheets/bank-account-sheet";
import CreateBankAccountSheet from "./bank-account/sheets/create-bank-account-dialog";
import { ConnectBankDialog } from "./bank-connection/connect-bank-dialog";
import { SelectBankAccountsModal } from "./bank-connection/select-bank-accounts";
import CreateTransactionSheet from "./transaction/sheets/create-transaction-sheet";
import ImportTransactionDrawerDialog from "./transaction/sheets/import-transaction-drawer-dialog";
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

      <CreateBankAccountSheet />
      <BankAccountSheet />

      <CreateTransactionSheet />
      <ImportTransactionDrawerDialog />
      <TransactionSheet />
    </>
  );
}
