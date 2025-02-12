import BankingOverview from "./_components/banking-overview";

export default function BankingPage() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <BankingOverview />
        {/* <BankAccountSelector /> */}
      </div>
    </>
  );
}
