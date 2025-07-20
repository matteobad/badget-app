import { BANK_PROVIDER, CONNECTION_STATUS } from "~/server/db/schema/enum";
import { capitalCase } from "change-case";
import { addDays, formatISO, parseISO, subDays } from "date-fns";

import type {
  ConnectionStatus,
  GetAccountsRequest,
  GetAccountsResponse,
  GetInstitutionsRequest,
  GetInstitutionsResponse,
} from "..";
import type {
  GC_CreateAgreementResponse,
  GC_CreateRequisitionResponse,
  GC_GetAccountBalancesResponse,
  GC_GetAccountDetailsResponse,
  GC_GetAccountMetadataResponse,
  GC_GetAccountRequest,
  GC_GetInstitutionByIdResponse,
  GC_GetInstitutionsRequest,
  GC_GetInstitutionsResponse,
  GC_GetRequisitionByIdResponse,
} from "./gocardless-types";
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
    provider: BANK_PROVIDER.GOCARDLESS,
    countries: data.countries,
    availableHistory: data.transaction_total_days,
  } satisfies GetInstitutionsResponse[number];
};

// ref: https://developer.gocardless.com/bank-account-data/statuses
export const mapRequisitionStatus = (
  status: GC_CreateRequisitionResponse["status"],
) => {
  switch (status) {
    case "CR": // CREATED
    case "GC": // GIVING_CONSENT
    case "UA": // UNDERGOING_AUTHENTICATION
    case "SA": // SELECTING_ACCOUNTS
    case "GA": // GRANTING_ACCESS
    case "EX": // EXPIRED
      return CONNECTION_STATUS.DISCONNECTED;
    case "LN":
      return CONNECTION_STATUS.CONNECTED;
    default:
      return CONNECTION_STATUS.UNKNOWN;
  }
};

export const mapRequisitionValidity = (
  created: GC_CreateRequisitionResponse["created"],
  days: GC_CreateAgreementResponse["access_valid_for_days"],
) => {
  return addDays(parseISO(created), days);
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
    rawId: accountId,
    name:
      detailsData.account.name ??
      detailsData.account.product ??
      institutionData.name ??
      "No name",
    balance: balancesData.balances[0].balanceAmount.amount,
    currency: detailsData.account.currency,
    type: "checking",
    description: "",
    // resource_id: detailsData.account.resourceId,
    // enrollment_id: null,
    logoUrl: institutionData.logo,
    enabled: true,
    manual: false,
  } satisfies GetAccountsResponse[number];
};

export const mapTransactionsRequest = (params: GetTransactionsRequest) => {
  return {
    id: params.accountId,
    date_from: params.latest
      ? formatISO(subDays(new Date(), 5), {
          representation: "date",
        })
      : undefined,
  } satisfies GC_GetTransactionsRequest;
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
  // const method = mapTransactionMethod(
  //   transaction?.proprietaryBankTransactionCode,
  // );

  // let currencyExchange: { rate: number; currency: string } | undefined;

  // if (Array.isArray(transaction.currencyExchange)) {
  //   const rate = Number.parseFloat(
  //     transaction.currencyExchange.at(0)?.exchangeRate ?? "",
  //   );

  //   if (rate) {
  //     const currency = transaction?.currencyExchange?.at(0)?.sourceCurrency;

  //     if (currency) {
  //       currencyExchange = {
  //         rate,
  //         currency: currency.toUpperCase(),
  //       };
  //     }
  //   }
  // }

  const name = transformTransactionName(transaction);
  const description = transformDescription({ transaction, name });
  // const balance = transaction?.balanceAfterTransaction?.balanceAmount?.amount
  //   ? +transaction.balanceAfterTransaction.balanceAmount.amount
  //   : null;

  return {
    rawId: transaction.internalTransactionId ?? transaction.transactionId,
    date: parseISO(transaction.bookingDateTime ?? transaction.bookingDate),
    // method,
    amount: parseFloat(transaction.transactionAmount.amount),
    currency: transaction.transactionAmount.currency,
    // category: mapTransactionCategory(transaction),
    // currency_rate: currencyExchange?.rate ?? null,
    // currency_source: currencyExchange?.currency?.toUpperCase() ?? null,
    // balance,
    description: name,
    note: description,
    // status: "posted",
  } satisfies GetTransactionsResponse[number];
};

export const transformConnectionStatus = (
  requisition?: GC_GetRequisitionByIdResponse,
): ConnectionStatus => {
  // Expired or Rejected
  if (requisition?.status === "EX" || requisition?.status === "RJ") {
    return {
      status: "disconnected",
    };
  }

  return {
    status: "connected",
  };
};
