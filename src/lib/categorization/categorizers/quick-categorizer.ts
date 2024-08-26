import { type Category, type Transaction } from "~/server/db";
import { type Categorizer } from "../interface";

export class QuickCategorizer implements Categorizer {
  priority = 1;

  async categorize(transaction: Transaction, categories: Category[]) {
    console.log("QuickCategorizer", { input: transaction.id });
    const lowerDescription = transaction.description?.toLowerCase() ?? "";

    const userCategories = categories.map((c) => [
      c.id!,
      c.name,
      c.macro,
      c.type,
    ]);

    for (const [id, ...keywords] of userCategories) {
      const match = keywords.some((keyword) => {
        const value = (keyword as string).toLowerCase();
        lowerDescription.includes(value);
      });

      if (match) {
        console.log("QuickCategorizer", { output: id });
        return id?.toString();
      }
    }

    console.log("QuickCategorizer", { output: undefined });
    return undefined; // Nessuna categoria trovata
  }
}
