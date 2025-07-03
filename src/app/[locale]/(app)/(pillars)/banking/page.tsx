import { BankingDashboard } from "~/features/dashboard/components/banking-dashboard";
import { type SearchParams } from "nuqs";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function BankingPage({}: PageProps) {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <BankingDashboard />
      </div>
    </>
  );
}
