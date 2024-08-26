import { type Transaction } from "~/server/db";
import { tokenize } from "./utils/tokenize";

export type UserRule = {
  keywords: Record<string, number>; // keyword -> relevance score
  category: string;
};

export const categorize = (t: Transaction, rules: UserRule[]) => {
  const tokens = tokenize(t.description ?? "");

  for (const rule of rules) {
    let score = 0;
    for (const token of tokens) {
      score += rule.keywords[token] ?? 0;
    }

    if (score > 0) {
      return rule.category;
    }
  }

  return null;
};
