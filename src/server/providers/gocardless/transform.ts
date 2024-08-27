import { capitalCase } from "change-case";

import type { Balance as BaseAccountBalance } from "../types";
import type {
  GocardlessTransaction,
  Institution,
  TransformAccount,
  TransformAccountBalance,
  TransformAccountName,
  TransformInstitution,
} from "./types";
import { type schema } from "~/server/db";
import { BankAccountType, Provider } from "~/server/db/schema/enum";

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

export const transformTransactionName = (
  transaction: GocardlessTransaction,
) => {
  let remittanceInformation = "";

  if (transaction?.remittanceInformationStructured) {
    remittanceInformation = capitalCase(
      transaction.remittanceInformationStructured,
    );
  }

  if (
    !remittanceInformation &&
    transaction?.remittanceInformationUnstructured
  ) {
    remittanceInformation = capitalCase(
      transaction.remittanceInformationUnstructured,
    );
  }

  if (
    !remittanceInformation &&
    transaction?.remittanceInformationUnstructuredArray?.at(0)
  ) {
    remittanceInformation = capitalCase(remittanceInformation);
  }

  if (transaction?.creditorName) {
    return [capitalCase(transaction.creditorName), remittanceInformation]
      .filter(Boolean)
      .join(" - ");
  }

  if (transaction?.debtorName) {
    return [capitalCase(transaction?.debtorName), remittanceInformation]
      .filter(Boolean)
      .join(" - ");
  }

  if (remittanceInformation) return remittanceInformation;

  if (transaction?.additionalInformation) {
    return capitalCase(transaction.additionalInformation);
  }

  console.log("No transaction name", transaction);

  return "No information";
};

export const transformTransaction = (transaction: GocardlessTransaction) => {
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

  const description = transformTransactionName(transaction);
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
  provider: Provider.GOCARDLESS,
});
