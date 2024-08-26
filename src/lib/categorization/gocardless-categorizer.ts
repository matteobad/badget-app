import { type Transaction as GocardlessTransaction } from "~/server/providers/gocardless/types";

type Rule = {
  keywords: string[];
  category: string;
};

// TODO: update me constantly with new data
const proprietaryBankTransactionCodeRules = [
  {
    category: "transfers",
    keywords: ["transfer", "transfers", "topup"],
  },
  {
    category: "uncategorized",
    keywords: ["card_payment"],
  },
] satisfies Rule[];

export const categorizeGocardless = (t: GocardlessTransaction) => {
  const code = t.proprietaryBankTransactionCode?.toLowerCase() ?? "";
  for (const rule of proprietaryBankTransactionCodeRules) {
    if (rule.keywords.includes(code)) return rule.category;
  }

  return null;
};
