// UserRuleBasedCategorizer.ts
import { type Category, type Transaction } from "~/server/db";
import { type Categorizer } from "../interface";

type CategoryRule = {
  id: string;
  userId: string;
  pattern: RegExp;
  categoryId: number;
  confidence: number;
};

export class RulesCategorizer implements Categorizer {
  priority = 1;

  // TODO: make this cached query
  private async getCategoryRules(categoryId: string) {
    return Promise.resolve([] as CategoryRule[]);
  }

  private escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  async categorize(transaction: Transaction, categories: Category[]) {
    console.log("RulesCategorizer", { input: transaction.id });
    const lowerDescription = transaction.description?.toLowerCase() ?? "";

    const rules = await this.getCategoryRules(transaction.userId);

    const pattern = new RegExp(this.escapeRegExp(lowerDescription), "i"); // Creiamo una regex basata sulla descrizione
    const rule = rules.find((rule) => rule.pattern.source === pattern.source);

    if (rule) {
      const category = categories.find((c) => c.id === rule.categoryId);
      console.log("RulesCategorizer", { output: category });
      return category?.id?.toString();
    }

    console.log("RulesCategorizer", { output: undefined });
    return undefined; // Nessuna categoria trovata
  }
}
