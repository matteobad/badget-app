import { performance } from "perf_hooks";
import { db } from "~/server/db";

import { categorizeTransactions } from "./categorization"; // Import the optimized function

const userId = "test-user";

// Generate mock transactions
const generateMockTransactions = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `tx-${i}`,
    name: `Payment for invoice ${i} at Starbucks`, // Simulating a real-world transaction
  }));

const benchmarkCategorization = async (num: number) => {
  const transactions = generateMockTransactions(num);

  // Warm-up: Preload rules into cache
  await categorizeTransactions(userId, transactions.slice(0, 10));

  const start = performance.now();
  await categorizeTransactions(userId, transactions);
  const end = performance.now();

  console.log(`Processed ${num} transactions in ${(end - start).toFixed(2)}ms`);
  console.log(`Average time per transaction: ${(end - start) / num}ms`);
};

// Run benchmarks with different batch sizes
const runBenchmarks = async () => {
  await db.transaction(async () => {
    console.log("Starting benchmarks...\n");

    await benchmarkCategorization(100);
    await benchmarkCategorization(1000);
    await benchmarkCategorization(10000);

    const used = process.memoryUsage();
    console.log(`Memory Usage: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);

    console.log("\nBenchmarking complete.");
  });
};

runBenchmarks().catch(console.error);
