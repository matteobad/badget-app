import { auth } from "@clerk/nextjs/server";

import { getCategories_CACHED } from "~/features/category/server/cached-queries";
import { BankingDashboard } from "~/features/dashboard/components/banking-dashboard";
import { getTransactions_CACHED } from "~/features/transaction/server/cached-queries";

export default async function BankingPage() {
  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const promises = Promise.all([
    getTransactions_CACHED(session.userId),
    getCategories_CACHED(session.userId),
  ]);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <BankingDashboard promises={promises} />
      </div>
    </>
  );
}
