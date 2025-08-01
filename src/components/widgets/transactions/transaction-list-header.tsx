export function TransactionsListHeader() {
  return (
    <div className="flex border-b-[1px] py-3">
      <span className="w-[65%] text-sm font-medium">Description</span>
      <span className="ml-auto w-[35%] text-right text-sm">Amount</span>
      {/* <span className="font-medium text-sm ml-auto">Status</span> */}
    </div>
  );
}
