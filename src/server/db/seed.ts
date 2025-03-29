import "dotenv/config";

import { reset, seed } from "drizzle-seed";

import { db, schema } from ".";
import {
  ROOT_CATEGORIES,
  SUB_CATEGORIES,
  SUB_CATEGORIES_2,
  SUB_CATEGORIES_BUDGETS,
} from "./data/categories";
import { AccountType, CONNECTION_STATUS, Provider } from "./schema/enum";

async function main() {
  /* eslint-disable */
  const {
    category_table,
    budget_table,
    rule_table,
    token_table,
    groups,
    groupsRelations,
    users,
    usersToGroupsRelations,
    usersRelations,
    usersToGroups,
    workspaceToAccounts,
    workspaceToAccountsRelations,
    ...rest
  } = schema;
  /* eslint-enable */

  await reset(db, rest);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(category_table).execute();
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(budget_table).execute();

  // Insert categories into the database
  await db.insert(category_table).values(ROOT_CATEGORIES);

  const inserted = await db
    .insert(category_table)
    .values(SUB_CATEGORIES)
    .returning({ id: category_table.id });

  await db.insert(category_table).values(SUB_CATEGORIES_2);
  await db.insert(budget_table).values(SUB_CATEGORIES_BUDGETS);

  await seed(db, rest).refine((f) => ({
    institution_table: {
      columns: {
        popularity: f.int({ minValue: 0, maxValue: 100 }),
        name: f.companyName({ isUnique: true }),
        originalId: f.uuid(),
        provider: f.valuesFromArray({
          values: Object.values(Provider),
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
          values: Object.values(Provider),
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
          values: Object.values(AccountType),
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
        amount: f.int({ minValue: 0 }),
        categoryId: f.valuesFromArray({ values: inserted.map((_) => _.id) }),
        currency: f.default({ defaultValue: "EUR" }),
        description: f.loremIpsum({ sentencesCount: 1 }),
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
