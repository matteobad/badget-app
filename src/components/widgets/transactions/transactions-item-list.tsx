import type { RouterOutput } from "~/server/api/trpc/routers/_app";

import { TransactionListItem } from "./transaction-list-item";

type Props = {
  date: string;
  transactions: NonNullable<RouterOutput["transaction"]["get"]["data"]>;
  disabled: boolean;
};

export function TransactionsItemList({ date, transactions, disabled }: Props) {
  console.log(date, transactions);

  return (
    <div>
      <div>{date}</div>
      <ul className="bullet-none scrollbar-hide cursor-pointer divide-y">
        {transactions?.map((transaction) => {
          return (
            <li key={transaction.id}>
              <TransactionListItem
                transaction={transaction}
                disabled={disabled}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
