import { Category, Transaction } from "~/server/db";

export interface Categorizer {
  priority: number;

  categorize: (
    transaction: Transaction,
    categories: Category[],
  ) => Promise<string | undefined>;
}
