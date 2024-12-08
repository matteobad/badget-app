"use server";

import { parse } from "csv-parse/sync";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { authActionClient } from "~/lib/safe-action";
import { db, schema } from "../db";

const importTransactionsSchema = z.object({
  file: z.instanceof(File),
  columnMapping: z.record(z.string()),
});

export const importTransactions = authActionClient
  .schema(importTransactionsSchema)
  .metadata({ actionName: "import-transactions-schema" })
  .action(async ({ parsedInput }) => {
    const { file, columnMapping } = parsedInput;
    const content = await file.text();
    const records = parse(content, { columns: true, skip_empty_lines: true });

    const importedTransactions = [];
    const importedAccounts = new Set();

    for (const record of records) {
      const transaction = {
        date: new Date(record[columnMapping.date!]),
        description: record[columnMapping.description!],
        amount: parseFloat(record[columnMapping.amount!]),
        category: record[columnMapping.category!],
        accountName: record[columnMapping.account!],
      };

      // Check if the account exists, if not create it
      if (!importedAccounts.has(transaction.accountName)) {
        const existingAccount = await db
          .select()
          .from(schema.accounts)
          .where(eq(schema.accounts.name, transaction.accountName))
          .limit(1);
        if (existingAccount.length === 0) {
          await db
            .insert(schema.accounts)
            .values({ name: transaction.accountName });
        }
        importedAccounts.add(transaction.accountName);
      }

      importedTransactions.push(transaction);
    }

    // Bulk insert transactions
    await db.insert(schema.transactions).values(importedTransactions);

    return { success: true, count: importedTransactions.length };
  });
