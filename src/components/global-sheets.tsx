"use client";

import { use } from "react";
import { uniqueCurrencies } from "~/shared/constants/currencies";

import { BankAccountSheet } from "./bank-account/sheets/bank-account-sheet";
import CreateBankAccountSheet from "./bank-account/sheets/create-bank-account-dialog";
import { ConnectBankDialog } from "./bank-connection/connect-bank-dialog";
import { SelectBankAccountsModal } from "./bank-connection/select-bank-accounts";
import { SearchModal } from "./search/search-modal";
import { ImportTransactionsModal } from "./transaction/import-csv/import-transactions-modal";
import CreateTransactionSheet from "./transaction/sheets/create-transaction-sheet";
import TransactionSheet from "./transaction/sheets/transaction-sheet";

type Props = {
  currencyPromise: Promise<string>;
  countryCodePromise: Promise<string>;
};

export function GlobalSheets({ currencyPromise, countryCodePromise }: Props) {
  const currency = use(currencyPromise);
  const countryCode = use(countryCodePromise);

  return (
    <>
      <ConnectBankDialog countryCode={countryCode} />
      <SelectBankAccountsModal />

      <CreateBankAccountSheet />
      <BankAccountSheet />

      <CreateTransactionSheet />
      <ImportTransactionsModal
        currencies={uniqueCurrencies}
        defaultCurrency={currency}
      />
      <TransactionSheet />

      <SearchModal />
    </>
  );
}
