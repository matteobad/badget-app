import { capitalCase } from "change-case";

import type { Balance as BaseAccountBalance } from "../types";
import type {
  Institution,
  Transaction,
  TransactionDescription,
  TransformAccount,
  TransformAccountBalance,
  TransformAccountName,
  TransformInstitution,
  TransformTransaction,
} from "./types";
import { type schema } from "~/server/db";
import { BankAccountType } from "~/server/db/schema/enum";

export const mapTransactionCategory = (transaction: Transaction) => {
  if (+transaction.transactionAmount.amount > 0) {
    return "income";
  }

  if (transaction?.proprietaryBankTransactionCode === "Transfer") {
    return "transfer";
  }

  return null;
};

export const mapTransactionMethod = (type?: string) => {
  switch (type) {
    case "Payment":
    case "Bankgiro payment":
    case "Incoming foreign payment":
      return "payment";
    case "Card purchase":
    case "Card foreign purchase":
      return "card_purchase";
    case "Card ATM":
      return "card_atm";
    case "Transfer":
      return "transfer";
    default:
      return "other";
  }
};

export const transformTransactionName = (transaction: Transaction) => {
  if (transaction?.creditorName) {
    return capitalCase(transaction.creditorName);
  }

  if (transaction?.debtorName) {
    return capitalCase(transaction?.debtorName);
  }

  if (transaction?.additionalInformation) {
    return capitalCase(transaction.additionalInformation);
  }

  if (transaction?.remittanceInformationStructured) {
    return capitalCase(transaction.remittanceInformationStructured);
  }

  if (transaction?.remittanceInformationUnstructured) {
    return capitalCase(transaction.remittanceInformationUnstructured);
  }

  const remittanceInformation =
    transaction?.remittanceInformationUnstructuredArray?.at(0);

  if (remittanceInformation) {
    return capitalCase(remittanceInformation);
  }

  console.log("No transaction name", transaction);

  return "No information";
};

const transformDescription = ({
  transaction,
  name,
}: TransactionDescription) => {
  if (transaction?.remittanceInformationUnstructuredArray?.length) {
    const text = transaction?.remittanceInformationUnstructuredArray.join(" ");
    const description = capitalCase(text);

    // NOTE: Sometimes the description is the same as name
    // Let's skip that and just save if they are not the same
    if (description !== name) {
      return description;
    }
  }

  const additionalInformation =
    transaction.additionalInformation &&
    capitalCase(transaction.additionalInformation);

  if (additionalInformation !== name) {
    return additionalInformation;
  }

  return null;
};

export const transformTransaction = (transaction: TransformTransaction) => {
  const method = mapTransactionMethod(
    transaction?.proprietaryBankTransactionCode,
  );

  let currencyExchange: { rate: number; currency: string } | undefined;

  if (Array.isArray(transaction.currencyExchange)) {
    const rate = Number.parseFloat(
      transaction.currencyExchange.at(0)?.exchangeRate ?? "",
    );

    if (rate) {
      const currency = transaction?.currencyExchange?.at(0)?.sourceCurrency;

      if (currency) {
        currencyExchange = {
          rate,
          currency,
        };
      }
    }
  }

  const name = transformTransactionName(transaction);
  const description = transformDescription({ transaction, name }) ?? null;
  const balance = transaction?.balanceAfterTransaction?.balanceAmount?.amount
    ? transaction.balanceAfterTransaction.balanceAmount.amount
    : null;

  return {
    userId: "",
    // accountId: "",
    amount: transaction.transactionAmount.amount,
    balance,
    // category: mapTransactionCategory(transaction),
    currency: transaction.transactionAmount.currency,
    currencyRate: currencyExchange?.rate?.toString() ?? null,
    currencySource: currencyExchange?.currency ?? null,
    date: new Date(transaction.bookingDate),
    description,
    method,
    name,
    status: "posted",
    transactionId:
      transaction.internalTransactionId ?? transaction.transactionId,
  } satisfies typeof schema.bankTransactions.$inferInsert;
};

const transformAccountName = (account: TransformAccountName) => {
  if (account?.name) {
    return capitalCase(account.name);
  }

  if (account?.product) {
    return account.product;
  }

  return "No name";
};

export const transformAccount = ({
  id,
  account,
  balance,
  institution,
}: TransformAccount) => {
  return {
    userId: "",
    accountId: id,
    type: BankAccountType.DEPOSITORY,
    name: transformAccountName({
      name: account.name,
      product: account.product,
    }),
    currency: account.currency,
    balance: transformAccountBalance(balance).amount.toString(),
    institutionId: transformInstitution(institution).id,
  } satisfies typeof schema.bankAccounts.$inferInsert;
};

export const transformAccountBalance = (
  account?: TransformAccountBalance,
): BaseAccountBalance => ({
  currency: account?.currency ?? "EUR",
  amount: +(account?.amount ?? 0),
});

export const transformInstitution = (
  institution: Institution,
): TransformInstitution => ({
  id: institution.id,
  name: institution.name,
  logo: `https://cdn-logos.gocardless.com/ais/${institution.id}.png`,
  provider: "gocardless",
});
