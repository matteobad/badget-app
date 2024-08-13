import { Suspense } from "react";

import {
  BankAccountList,
  BankAccountListLoading,
} from "./_components/bank-account-list.server";

export default function AccountsPage() {
  return (
    <Suspense fallback={<BankAccountListLoading />}>
      <BankAccountList />
    </Suspense>
  );
}
