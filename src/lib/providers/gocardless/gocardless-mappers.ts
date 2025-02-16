import { capitalCase } from "change-case";

import type {
  GetAccountsRequest,
  GetAccountsResponse,
  GetInstitutionsRequest,
} from "..";
import type {
  GC_CreateRequisitionResponse,
  GC_GetAccountBalancesResponse,
  GC_GetAccountDetailsResponse,
  GC_GetAccountMetadataResponse,
  GC_GetAccountRequest,
  GC_GetInstitutionByIdResponse,
  GC_GetInstitutionsRequest,
  GC_GetInstitutionsResponse,
} from "./gocardless-types";
import { ConnectionStatus, Provider } from "~/server/db/schema/enum";
import { type DB_InstitutionInsertType } from "~/server/db/schema/open-banking";
import { type GetTransactionsRequest, type GetTransactionsResponse } from "..";
import {
  type GC_GetTransactionsRequest,
  type GC_Transaction,
} from "./gocardless-types";

export const mapInstitutionsRequest = (params: GetInstitutionsRequest) => {
  return {
    country: params.countryCode ?? "IT",
  } satisfies GC_GetInstitutionsRequest;
};

export const mapInstitutionsResponse = (
  data: GC_GetInstitutionsResponse[number],
) => {
  return {
    originalId: data.id,
    logo: data.logo,
    name: data.name,
    provider: Provider.GOCARDLESS,
    countries: data.countries,
    availableHistory: data.transaction_total_days,
  } satisfies DB_InstitutionInsertType;
};

export const mapRequisitionStatus = (
  status: GC_CreateRequisitionResponse["status"],
) => {
  switch (status) {
    case "CR":
      return ConnectionStatus.CREATED;
    case "ID":
    case "GC":
    case "UA":
    case "GA":
    case "SA":
    case "SU":
      return ConnectionStatus.PENDING;
    case "LN":
      return ConnectionStatus.LINKED;
    case "RJ":
    case "ER":
      return ConnectionStatus.ERROR;
    case "EX":
      return ConnectionStatus.EXPIRED;
    default:
      return ConnectionStatus.UNKNOWN;
  }
};

export const mapAccountsRequest = (params: GetAccountsRequest) => {
  return {
    id: params.id!,
  } satisfies GC_GetAccountRequest;
};

export const mapAccountsResponse = (
  accountId: string,
  metadataData: GC_GetAccountMetadataResponse,
  detailsData: GC_GetAccountDetailsResponse,
  balancesData: GC_GetAccountBalancesResponse,
  institutionData: GC_GetInstitutionByIdResponse,
) => {
  return {
    id: accountId,
    name:
      detailsData.account.name ??
      detailsData.account.product ??
      institutionData.name ??
      "No name",
    balance: {
      amount: parseFloat(balancesData.balances[0].balanceAmount.amount),
      currency: balancesData.balances[0].balanceAmount.currency,
    },
    currency: detailsData.account.currency,
    resource_id: detailsData.account.resourceId,
    enrollment_id: null,
    institution: {
      id: institutionData.id,
      logo: institutionData.logo,
      name: institutionData.name,
      provider: "gocardless",
    },
    type: "depository",
  } satisfies GetAccountsResponse[number];
};

export const mapTransactionsRequest = (params: GetTransactionsRequest) => {
  return {
    id: params.accountId,
  } satisfies GC_GetTransactionsRequest;
};

const mapTransactionCategory = (transaction: GC_Transaction) => {
  if (+transaction.transactionAmount.amount > 0) {
    return "income";
  }

  if (transaction?.proprietaryBankTransactionCode === "Transfer") {
    return "transfer";
  }

  return null;
};

const mapTransactionMethod = (type?: string) => {
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

const transformDescription = ({
  transaction,
  name,
}: {
  transaction: GC_Transaction;
  name: string;
}) => {
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

const transformTransactionName = (transaction: GC_Transaction) => {
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

  // When there is no name, we use the proprietary bank transaction code (Service Fee)
  if (transaction.proprietaryBankTransactionCode) {
    return transaction.proprietaryBankTransactionCode;
  }

  return "No information";
};

export const mapTransactionsResponse = (transaction: GC_Transaction) => {
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
          currency: currency.toUpperCase(),
        };
      }
    }
  }

  const name = transformTransactionName(transaction);
  const description = transformDescription({ transaction, name }) ?? null;
  const balance = transaction?.balanceAfterTransaction?.balanceAmount?.amount
    ? +transaction.balanceAfterTransaction.balanceAmount.amount
    : null;

  return {
    id: transaction.internalTransactionId,
    date: transaction.bookingDate,
    name,
    method,
    amount: +transaction.transactionAmount.amount,
    currency: transaction.transactionAmount.currency,
    category: mapTransactionCategory(transaction),
    currency_rate: currencyExchange?.rate ?? null,
    currency_source: currencyExchange?.currency?.toUpperCase() ?? null,
    balance,
    description,
    status: "posted",
  } satisfies GetTransactionsResponse[number];
};
