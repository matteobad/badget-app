import type { CreateTransactionEmbeddingParams } from "~/server/domain/transaction/mutations";
import { logger, schemaTask } from "@trigger.dev/sdk";
import { db } from "~/server/db";
import { createTransactionEmbeddings } from "~/server/domain/transaction/mutations";
import { getTransactionsForEmbedding } from "~/server/domain/transaction/queries";
import { z } from "zod/v4";

import { generateEmbeddings } from "../utils/embeddings";
import { processBatch } from "../utils/process-batch";
import { prepareTransactionText } from "../utils/text-preparation";
import { enrichTransactionsTask } from "./enrich-transactions";

const BATCH_SIZE = 50;

export const embedTransactionsTask = schemaTask({
  id: "embed-transactions",
  schema: z.object({
    transactionIds: z.array(z.uuid()),
    organizationId: z.uuid(),
  }),
  machine: "micro",
  maxDuration: 180,
  queue: {
    concurrencyLimit: 3,
  },
  run: async ({ transactionIds, organizationId }) => {
    // Step 1: Attempt to enrich transactions first (non-blocking)
    try {
      await enrichTransactionsTask.triggerAndWait({
        transactionIds,
        organizationId,
      });
      logger.info("Transaction enrichment completed successfully", {
        organizationId,
      });
    } catch (error) {
      logger.warn(
        "Transaction enrichment failed, proceeding with embedding anyway",
        {
          organizationId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      );
    }

    // Step 2: Get transactions that need embedding
    const transactionsToEmbed = await getTransactionsForEmbedding(db, {
      transactionIds,
      organizationId,
    });

    if (transactionsToEmbed.length === 0) {
      logger.info("No transactions need embedding", {
        organizationId,
        requestedCount: transactionIds.length,
      });
      return;
    }

    logger.info("Starting transaction embedding", {
      organizationId,
      transactionCount: transactionsToEmbed.length,
      requestedCount: transactionIds.length,
    });

    // Process in batches using utility
    await processBatch(transactionsToEmbed, BATCH_SIZE, async (batch) => {
      const validItems = [];

      for (const tx of batch) {
        const text = prepareTransactionText(tx);
        if (text.trim().length > 0) {
          validItems.push({ transaction: tx, text });
        }
      }

      if (validItems.length === 0) {
        logger.warn("No valid text content in batch", {
          batchSize: batch.length,
          organizationId,
        });
        return [];
      }

      // Extract texts and generate embeddings
      const texts = validItems.map((item) => item.text);
      const { embeddings, model } = await generateEmbeddings(texts);

      // Validate embeddings array length
      if (embeddings.length !== validItems.length) {
        throw new Error(
          `Embeddings count mismatch: expected ${validItems.length}, got ${embeddings.length}`,
        );
      }

      // Create embedding records
      const embeddingsToInsert: CreateTransactionEmbeddingParams[] =
        validItems.map((item, index: number) => {
          const embedding = embeddings[index];
          if (!embedding) {
            throw new Error(`Missing embedding at index ${index}`);
          }
          return {
            transactionId: item.transaction.id,
            organizationId,
            embedding,
            sourceText: item.text,
            model,
          };
        });

      // Insert embeddings
      const result = await createTransactionEmbeddings(db, embeddingsToInsert);

      logger.info("Transaction embeddings batch created", {
        batchSize: embeddingsToInsert.length,
        organizationId,
      });

      return result;
    });

    logger.info("All transaction embeddings created", {
      totalCount: transactionsToEmbed.length,
      organizationId,
    });
  },
});
