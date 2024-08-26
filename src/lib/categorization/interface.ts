import { type Category, type Transaction } from "~/server/db";

export interface UserRule {
  keywords: Record<string, number>; // keyword -> relevance score
  category: string;
}

export interface Categorizer {
  priority: number;

  categorize: (
    transaction: Transaction,
    categories: Category[],
  ) => Promise<string | undefined>;
}
