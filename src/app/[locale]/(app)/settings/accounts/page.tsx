import BankAccountList from "./_components/bank-account-list";

export default function BankingPage() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <BankAccountList />
      </div>
    </>
  );
}
