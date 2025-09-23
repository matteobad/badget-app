import type { RouterOutput } from "~/server/api/trpc/routers/_app";

import { TransactionListItem } from "./transaction-list-item";

type Props = {
  transactions: NonNullable<RouterOutput["transaction"]["get"]["data"]>;
  disabled: boolean;
};

export function TransactionsItemList({ transactions, disabled }: Props) {
  return (
    <ul className="bullet-none scrollbar-hide aspect-square cursor-pointer divide-y overflow-auto pb-24">
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
  );
}
