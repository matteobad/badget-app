import type { TransactionForEnrichment } from "~/server/domain/transaction/queries";

import type {
  CategoryData,
  TransactionData,
  UpdateData,
} from "./enrichment-schema";

/**
 * Generates the enrichment prompt for the LLM
 */
export function generateEnrichmentPrompt(
  transactionData: TransactionData[],
  batch: TransactionForEnrichment[],
  categories: CategoryData[],
): string {
  const transactionList = transactionData
    .map((tx, index) => {
      const transaction = batch[index];
      const hasExistingMerchant = transaction?.merchantName;

      return `${index + 1}. Description: "${tx.description}", Amount: ${tx.amount}, Currency: ${tx.currency}${
        hasExistingMerchant
          ? ` (Current Merchant: ${transaction.merchantName})`
          : ""
      }`;
    })
    .join("\n");

  const needsCategories = batch.some((tx) => !tx.categorySlug);

  let returnInstructions = "Return for each transaction:\n";
  returnInstructions +=
    "- merchantName: Clean merchant name, or `null` if uncertain.\n";
  if (needsCategories) {
    returnInstructions +=
      "- categorySlug: Best matching category slug from the list below, or `null` if no clear match.\n";
  }

  const categoryList = categories
    .map((cat) => {
      const parent = cat.parentSlug ? `(child of ${cat.parentSlug})` : "";
      const desc = cat.description ? ` — ${cat.description}` : "";
      return `• ${cat.slug} → ${cat.name} ${parent}${desc}`;
    })
    .join("\n");

  return `You are a personal finance transaction enrichment system.

TASK: For EVERY transaction:
1. Identify the **merchantName**:
   - Remove noise like store numbers, IDs, or method suffixes.
   - Prefer recognizable brand or merchant names (e.g. "Starbucks", "Amazon", "Esselunga").
   - If no merchant can be confidently identified, return \`null\`.

2. Assign the **categorySlug** (if required):
   - Use ONLY the categories provided in the allowed list.
   - Prefer the most specific (leaf) category that fits.
   - If no clear match, return \`null\`.

STRICT RULES:
- Never invent new merchants or categories.
- Do not guess if uncertain — prefer \`null\`.

ALLOWED CATEGORIES:
${categoryList}

OUTPUT FORMAT:
${returnInstructions}

Transactions to process:
${transactionList}

Return exactly ${batch.length} results in order, as JSON objects.`;
}

/**
 * Prepares transaction data for LLM processing
 */
export function prepareTransactionData(
  batch: TransactionForEnrichment[],
): TransactionData[] {
  return batch.map((tx) => {
    // Build a comprehensive description with all available information
    const parts: string[] = [];

    if (tx.counterpartyName) {
      parts.push(`Counterparty: ${tx.counterpartyName}`);
    }

    if (tx.name && tx.name !== tx.counterpartyName) {
      parts.push(`Raw: ${tx.name}`);
    }

    if (
      tx.description &&
      tx.description !== tx.counterpartyName &&
      tx.description !== tx.name
    ) {
      parts.push(`Description: ${tx.description}`);
    }

    // Fallback to just name if no counterparty
    const description = parts.length > 0 ? parts.join(" | ") : tx.name;

    return {
      description,
      amount: tx.amount.toString(),
      currency: tx.currency,
    };
  });
}

/**
 * Prepares update data, enhancing merchant names to legal entity names and category classifications
 */
export function prepareUpdateData(
  transaction: {
    categorySlug: string | null;
    merchantName: string | null;
    amount: number;
  },
  result: { merchant: string | null; category: string | null },
): UpdateData {
  const updateData: UpdateData = {};

  // Always update merchantName if the LLM provides one
  // This allows enhancement of existing simplified names to formal legal entity names
  if (result.merchant) {
    updateData.merchantName = result.merchant;
  }

  // Only update categorySlug if it's currently null AND amount is not positive
  // Positive amounts are typically income and shouldn't be categorized as business expenses
  if (!transaction.categorySlug && transaction.amount <= 0) {
    updateData.categorySlug = result.category ?? undefined;
  }

  return updateData;
}
