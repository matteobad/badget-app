import { type Transaction } from "~/server/db";
import { type getUserCategoryRules } from "~/server/db/queries/cached-queries";
import { tokenize } from "./tokenize";

type BaseTransaction = Pick<Transaction, "amount" | "description">;

export type UserRule = Awaited<ReturnType<typeof getUserCategoryRules>>[number];

export const categorize = (t: BaseTransaction, rules: UserRule[]) => {
  // split into token + sanitize
  const tokens = tokenize(t.description);

  // rule based categorization
  const ruleScores: { id: number; score: number }[] = [];
  for (const rule of rules) {
    let score = 0;
    for (const token of tokens) {
      score += rule.keywords.get(token) ?? 0;
    }

    if (score > 0) {
      ruleScores.push({
        id: rule.id,
        score: score,
      });
    }
  }

  if (ruleScores.length > 0) {
    return ruleScores.sort((a, b) => b.score - a.score)[0]!.id;
  }

  // default categorization
  return null;
};
