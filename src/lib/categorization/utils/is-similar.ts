import { type UserRule } from "../interface";

export const isSimilar = (rule: UserRule, tokens: string[]) => {
  const matchingKeywords = tokens.filter((token) => rule.keywords[token]);
  const similarity =
    matchingKeywords.length /
    Math.max(tokens.length, Object.keys(rule.keywords).length);
  return similarity > 0.5; // Threshold di similarità del 50%
};
