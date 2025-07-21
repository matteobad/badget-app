import "dotenv/config";

import { reset, seed } from "drizzle-seed";

import { db, schema } from ".";
import { budgetList } from "./data/budgets";
import { categoriesIds, categoriesMap } from "./data/categories";
import {
  ACCOUNT_TYPE,
  BANK_PROVIDER,
  CONNECTION_STATUS,
  TRANSACTION_FREQUENCY,
  TRANSACTION_METHOD,
  TRANSACTION_STATUS,
} from "./schema/enum";

async function main() {
  /* eslint-disable */
  const { category_table, budget_table, rule_table, token_table, ...rest } =
    schema;
  /* eslint-enable */

  await reset(db, rest);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(category_table).execute();
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(budget_table).execute();

  // Insert categories into the database
  await db.insert(category_table).values(categoriesMap[0]!);
  await db.insert(category_table).values(categoriesMap[1]!);
  await db.insert(category_table).values(categoriesMap[2]!);
  await db.insert(budget_table).values(budgetList);

  await seed(db, rest).refine((f) => ({
    institution_table: {
      columns: {
        popularity: f.int({ minValue: 0, maxValue: 100 }),
        name: f.companyName({ isUnique: true }),
        originalId: f.uuid(),
        provider: f.valuesFromArray({
          values: Object.values(BANK_PROVIDER),
        }),
        countries: f.default({ defaultValue: ["IT"] }),
        updatedAt: f.default({ defaultValue: null }),
        deletedAt: f.default({ defaultValue: null }),
      },
      count: 100,
    },
    connection_table: {
      columns: {
        provider: f.valuesFromArray({
          values: Object.values(BANK_PROVIDER),
        }),
        status: f.valuesFromArray({
          values: Object.values(CONNECTION_STATUS),
        }),
        referenceId: f.uuid(),
        userId: f.default({ defaultValue: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD" }),
        updatedAt: f.default({ defaultValue: null }),
        deletedAt: f.default({ defaultValue: null }),
      },
      with: {
        account_table: 3,
      },
      count: 5,
    },
    account_table: {
      columns: {
        name: f.companyName(),
        balance: f.int({ minValue: 0 }),
        currency: f.default({ defaultValue: "EUR" }),
        description: f.loremIpsum({ sentencesCount: 1 }),
        type: f.valuesFromArray({
          values: Object.values(ACCOUNT_TYPE),
        }),
        logoUrl: f.default({
          defaultValue: "https://cdn-engine.midday.ai/default.jpg",
        }),
        userId: f.default({ defaultValue: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD" }),
        updatedAt: f.default({ defaultValue: null }),
        deletedAt: f.default({ defaultValue: null }),
      },
      with: {
        transaction_table: 500,
      },
    },
    transaction_table: {
      columns: {
        id: f.uuid(),
        amount: f.int({ minValue: -1230, maxValue: 2500 }),
        categoryId: f.valuesFromArray({ values: categoriesIds }),
        status: f.valuesFromArray({
          values: Object.values(TRANSACTION_STATUS),
        }),
        method: f.valuesFromArray({
          values: Object.values(TRANSACTION_METHOD),
        }),
        frequency: f.valuesFromArray({
          values: Object.values(TRANSACTION_FREQUENCY),
        }),
        currency: f.default({ defaultValue: "EUR" }),
        name: f.loremIpsum({ sentencesCount: 1 }),
        note: f.loremIpsum({ sentencesCount: 2 }),
        rawId: f.uuid(),
        userId: f.default({ defaultValue: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD" }),
        updatedAt: f.default({ defaultValue: null }),
        deletedAt: f.default({ defaultValue: null }),
      },
    },
    tag_table: {
      columns: {
        userId: f.default({ defaultValue: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD" }),
        updatedAt: f.default({ defaultValue: null }),
        deletedAt: f.default({ defaultValue: null }),
      },
    },
  }));

  await db.$client.end();
}

await main();
