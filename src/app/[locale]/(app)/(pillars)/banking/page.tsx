import { auth } from "@clerk/nextjs/server";
import { getCategories_CACHED } from "~/features/category/server/cached-queries";
import { BankingDashboard } from "~/features/dashboard/components/banking-dashboard";
import { getTransactions_CACHED } from "~/features/transaction/server/cached-queries";
import { transactionsSearchParamsCache } from "~/features/transaction/utils/search-params";
import { type SearchParams } from "nuqs";

type PageProps = {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
};

export default async function BankingPage({ searchParams }: PageProps) {
  const { ...search } = await transactionsSearchParamsCache.parse(searchParams);

  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const promises = Promise.all([
    getTransactions_CACHED(search, session.userId),
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
