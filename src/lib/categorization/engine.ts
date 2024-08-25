import { Category, Transaction } from "~/server/db";
import { Categorizer } from "./interface";

export class HybridCategorizationEngine {
  private categorizers: Categorizer[];

  constructor(...categorizers: Categorizer[]) {
    this.categorizers = categorizers.sort((a, b) => a.priority - b.priority);
  }

  private getUncategorizedId(categories: Category[]) {
    const category = categories.find(
      (c) => c.name.toLowerCase() === "uncategorized",
    );

    if (!category?.id) {
      throw new Error("No category 'uncategorized' for the user");
    }

    return category.id;
  }

  async categorize(transaction: Transaction, categories: Category[]) {
    let category: string | undefined;

    for (const categorizer of this.categorizers) {
      category = await categorizer.categorize(transaction, categories);
      if (category) break;
    }

    return category || this.getUncategorizedId(categories);
  }
}
