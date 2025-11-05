"use client";

import { BankAccountSheet } from "./bank-account/sheets/bank-account-sheet";
import CreateBankAccountSheet from "./bank-account/sheets/create-bank-account-dialog";
import { ConnectBankDialog } from "./bank-connection/connect-bank-dialog";
import { SelectBankAccountsModal } from "./bank-connection/select-bank-accounts";
import { SearchModal } from "./search/search-modal";
import { ImportTransactionsModal } from "./transaction/import-csv/import-transactions-modal";
import CreateTransactionSheet from "./transaction/sheets/create-transaction-sheet";
import { TransactionEditSheet } from "./transaction/sheets/transaction-edit-sheet";
import TransactionSheet from "./transaction/sheets/transaction-sheet";

export function GlobalSheets() {
  return (
    <>
      <ConnectBankDialog />
      <SelectBankAccountsModal />

      <CreateBankAccountSheet />
      <BankAccountSheet />

      <CreateTransactionSheet />
      <ImportTransactionsModal />
      <TransactionEditSheet />
      <TransactionSheet />

      <SearchModal />
    </>
  );
}
