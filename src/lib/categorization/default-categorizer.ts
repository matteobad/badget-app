import { type Transaction } from "~/server/db";

export const categorize = (t: Transaction) => {
  const amount = parseFloat(t.amount ?? "0");
  if (amount === 0) return "transfers";
  else if (amount > 0) return "income";
  else return "uncategorized";
};
