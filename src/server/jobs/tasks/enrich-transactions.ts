import type { UpdateTransactionEnrichmentParams } from "~/server/domain/transaction/queries";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { logger, schemaTask } from "@trigger.dev/sdk";
import { db } from "~/server/db";
import { getCategoriesForEnrichment } from "~/server/domain/category/queries";
import {
  getTransactionsForEnrichment,
  markTransactionsAsEnriched,
  updateTransactionEnrichments,
} from "~/server/domain/transaction/queries";
import { generateObject } from "ai";
import { z } from "zod/v4";

import {
  generateEnrichmentPrompt,
  prepareTransactionData,
  prepareUpdateData,
} from "../utils/enrichment-helpers";
import { buildEnrichmentSchema } from "../utils/enrichment-schema";
import { processBatch } from "../utils/process-batch";

const BATCH_SIZE = 50;
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

const google = createGoogleGenerativeAI({
  apiKey: GOOGLE_API_KEY,
});

export const enrichTransactionsTask = schemaTask({
  id: "enrich-transactions",
  schema: z.object({
    transactionIds: z.array(z.uuid()),
    organizationId: z.uuid(),
  }),
  machine: "micro",
  maxDuration: 300, // 5 minutes for batch processing
  queue: {
    concurrencyLimit: 2, // Lower to manage API costs
  },
  run: async ({ transactionIds, organizationId }) => {
    // Get transactions that need enrichment
    const transactionsToEnrich = await getTransactionsForEnrichment(db, {
      transactionIds,
      organizationId,
    });

    if (transactionsToEnrich.length === 0) {
      logger.info("No transactions need enrichment", { organizationId });
      return { enrichedCount: 0, organizationId };
    }

    const categories = await getCategoriesForEnrichment(db, {
      organizationId,
    });

    logger.info("Starting transaction enrichment", {
      organizationId,
      transactionCount: transactionsToEnrich.length,
    });

    let totalEnriched = 0;

    // Process in batches of 50
    await processBatch(
      transactionsToEnrich,
      BATCH_SIZE,
      async (batch): Promise<string[]> => {
        // Prepare transactions for LLM
        const transactionData = prepareTransactionData(batch);
        const prompt = generateEnrichmentPrompt(
          transactionData,
          batch,
          categories,
        );

        // Track transactions enriched in this batch to avoid double counting
        let batchEnrichedCount = 0;

        try {
          const { object } = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            prompt,
            output: "array",
            schema: buildEnrichmentSchema(categories.map((c) => c.slug)),
            temperature: 0.1, // Low temperature for consistency
          });

          // Prepare updates for batch processing
          const updates: UpdateTransactionEnrichmentParams[] = [];
          const noUpdateNeeded: string[] = [];
          let categoriesUpdated = 0;
          let skippedResults = 0;

          // With output: "array", object is the array directly
          const results = object;
          const resultsToProcess = Math.min(results.length, batch.length);

          for (let i = 0; i < resultsToProcess; i++) {
            const result = results[i];
            const transaction = batch[i];

            if (!result || !transaction) {
              skippedResults++;
              // Still mark the transaction as processed even if LLM result is invalid
              if (transaction) {
                noUpdateNeeded.push(transaction.id);
              }
              continue;
            }

            const updateData = prepareUpdateData(transaction, result);

            // Check if any updates are needed
            if (!updateData.merchantName && !updateData.categorySlug) {
              // No updates needed - mark as enriched separately
              noUpdateNeeded.push(transaction.id);
              continue;
            }

            // Track if category was updated
            if (updateData.categorySlug) {
              categoriesUpdated++;
            }

            updates.push({
              transactionId: transaction.id,
              data: updateData,
            });
          }

          // Log if we have mismatched result counts
          if (results.length !== batch.length) {
            logger.warn(
              "LLM returned different number of results than expected",
              {
                expectedCount: batch.length,
                actualCount: results.length,
                organizationId,
              },
            );
          }

          // Execute all updates
          if (updates.length > 0) {
            await updateTransactionEnrichments(db, updates);
            batchEnrichedCount += updates.length;
          }

          // Mark transactions that don't need updates as enriched
          if (noUpdateNeeded.length > 0) {
            await markTransactionsAsEnriched(db, noUpdateNeeded);
            batchEnrichedCount += noUpdateNeeded.length;
          }

          const totalProcessed = updates.length + noUpdateNeeded.length;
          if (totalProcessed > 0) {
            logger.info("Enriched transaction batch", {
              batchSize: batch.length,
              enrichedCount: totalProcessed,
              updatesApplied: updates.length,
              noUpdateNeeded: noUpdateNeeded.length,
              merchantNamesUpdated: updates.filter(
                (update) => update.data.merchantName,
              ).length,
              categoriesUpdated,
              skippedResults,
              organizationId,
            });
          }

          // Ensure ALL transactions in the batch are marked as enrichment completed
          // This is critical for UI loading states - enrichment_completed indicates the process finished, not success
          const processedIds = new Set([
            ...updates.map((u) => u.transactionId),
            ...noUpdateNeeded,
          ]);

          const unprocessedTransactions = batch.filter(
            (tx) => !processedIds.has(tx.id),
          );

          // Mark ANY remaining unprocessed transactions as enriched (process completed, even if no data found)
          if (unprocessedTransactions.length > 0) {
            await markTransactionsAsEnriched(
              db,
              unprocessedTransactions.map((tx) => tx.id),
            );
            batchEnrichedCount += unprocessedTransactions.length;

            logger.info(
              "Marked remaining unprocessed transactions as completed",
              {
                count: unprocessedTransactions.length,
                reason: "enrichment_process_finished",
                organizationId,
              },
            );
          }

          // Add the actual count of enriched transactions from this batch
          totalEnriched += batchEnrichedCount;

          // Return ALL transaction IDs from the batch (all should now be marked as enriched)
          // Defensive handling for potentially falsy transactions
          return batch.filter((tx) => tx?.id).map((tx) => tx.id);
        } catch (error) {
          logger.error("Failed to enrich transaction batch", {
            error: error instanceof Error ? error.message : "Unknown error",
            batchSize: batch.length,
            organizationId,
          });

          // Even if enrichment fails, mark all transactions as completed to prevent infinite loading
          // The enrichment_completed field indicates process completion, not success
          try {
            // Defensive handling for potentially falsy transactions
            const validTransactionIds = batch
              .filter((tx) => tx?.id)
              .map((tx) => tx.id);

            await markTransactionsAsEnriched(db, validTransactionIds);

            logger.info(
              "Marked failed batch transactions as completed to prevent infinite loading",
              {
                count: validTransactionIds.length,
                reason: "enrichment_process_failed_but_completed",
                organizationId,
              },
            );

            // Only add transactions that weren't already counted in batchEnrichedCount
            // If batchEnrichedCount > 0, some transactions were already processed and counted
            const uncountedTransactions =
              validTransactionIds.length - batchEnrichedCount;
            if (uncountedTransactions > 0) {
              totalEnriched += uncountedTransactions;
            }

            // Return the valid transaction IDs even though enrichment failed
            return validTransactionIds;
          } catch (markError) {
            logger.error(
              "Failed to mark transactions as completed after enrichment error",
              {
                markError:
                  markError instanceof Error
                    ? markError.message
                    : "Unknown error",
                originalError:
                  error instanceof Error ? error.message : "Unknown error",
                batchSize: batch.length,
                organizationId,
              },
            );
            throw error; // Re-throw original error
          }
        }
      },
    );

    logger.info("Transaction enrichment completed", {
      totalEnriched,
      organizationId,
    });

    return { enrichedCount: totalEnriched, organizationId };
  },
});
