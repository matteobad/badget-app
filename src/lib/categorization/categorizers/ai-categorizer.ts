// AdvancedCategorizer.ts

// Simuliamo l'importazione di un SDK per Vercel AI
import { VercelAISDK } from "vercel-ai-sdk";

import { Transaction } from "./Transaction";

export class AdvancedCategorizer {
  private aiClient: VercelAISDK;

  constructor(apiKey: string) {
    this.aiClient = new VercelAISDK(apiKey);
  }

  async categorizeWithAI(
    transaction: Transaction,
  ): Promise<string | undefined> {
    try {
      const response = await this.aiClient.categorizeTransaction(
        transaction.description,
        transaction.amount,
      );
      return response.category;
    } catch (error) {
      console.error("Errore durante la categorizzazione con Vercel AI:", error);
      return undefined;
    }
  }
}
