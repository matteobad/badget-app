"use client";

import type { ReactNode } from "react";
import { createContext, use } from "react";

import { type getPendingBankConnections } from "~/lib/data";
import {
  type getFilteredInstitutions,
  type getUncategorizedTransactions,
  type getUserBankConnections,
  type getUserCategories,
} from "~/server/db/queries/cached-queries";

type InstitutionsPromise = ReturnType<typeof getFilteredInstitutions>;
type ConnectionsPromise = ReturnType<typeof getUserBankConnections>;
type PendingConnectionsPromise = ReturnType<typeof getPendingBankConnections>;
type TransactionsPromise = ReturnType<typeof getUncategorizedTransactions>;
type CategoriesPromise = ReturnType<typeof getUserCategories>;

type Banking = {
  institutionsPromise: InstitutionsPromise;
  connectionsPromise: ConnectionsPromise;
  pendingConnectionsPromise: PendingConnectionsPromise;
  transactionsPromise: TransactionsPromise;
  categoriesPromise: CategoriesPromise;
};

const BankingContext = createContext<Banking | null>(null);

export function useInstitutions() {
  const bankingPromises = use(BankingContext);
  if (!bankingPromises) {
    throw new Error("useInstitutions must be used within a BankingProvider");
  }
  const institutions = use(bankingPromises.institutionsPromise);
  return institutions;
}

export function useConnections() {
  const bankingPromises = use(BankingContext);
  if (!bankingPromises) {
    throw new Error("useConnections must be used within a BankingProvider");
  }
  const connections = use(bankingPromises.connectionsPromise);
  const pending = use(bankingPromises.pendingConnectionsPromise);
  return [...pending, ...connections].map((item) => {
    return {
      ...item,
      bankAccount: item.bankAccount.map((account) => {
        return {
          ...account,
          balance: account.balance?.toString(), // TODO: why is this necessary?
        };
      }),
    };
  });
}

export function useTransactions() {
  const bankingPromises = use(BankingContext);
  if (!bankingPromises) {
    throw new Error("useConnections must be used within a BankingProvider");
  }
  const transactions = use(bankingPromises.transactionsPromise);
  return transactions;
}

export function useCategories() {
  const bankingPromises = use(BankingContext);
  if (!bankingPromises) {
    throw new Error("useConnections must be used within a BankingProvider");
  }
  const categories = use(bankingPromises.categoriesPromise);
  return categories;
}

export function BankingProvider({
  children,
  ...promises
}: {
  children: ReactNode;
  institutionsPromise: InstitutionsPromise;
  connectionsPromise: ConnectionsPromise;
  pendingConnectionsPromise: PendingConnectionsPromise;
  transactionsPromise: TransactionsPromise;
  categoriesPromise: CategoriesPromise;
}) {
  return (
    <BankingContext.Provider value={promises}>
      {children}
    </BankingContext.Provider>
  );
}
