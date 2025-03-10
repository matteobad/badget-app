import "dotenv/config";

import { reset, seed } from "drizzle-seed";

import { db, schema } from ".";
import { categoryIcons } from "./data/categories";
import {
  AccountType,
  CATEGORY_TYPE,
  CONNECTION_STATUS,
  Provider,
} from "./schema/enum";

async function main() {
  /* eslint-disable */
  const {
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

  await seed(db, rest).refine((f) => ({
    category_table: {
      columns: {
        parentId: f.default({ defaultValue: null }),
        type: f.valuesFromArray({
          values: Object.values(CATEGORY_TYPE),
        }),
        icon: f.valuesFromArray({ values: categoryIcons, isUnique: true }),
        description: f.loremIpsum({ sentencesCount: 1 }),
        userId: f.default({ defaultValue: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD" }),
        deletedAt: f.default({ defaultValue: null }),
      },
      count: 10,
    },
    institution_table: {
      columns: {
        popularity: f.int({ minValue: 0, maxValue: 100 }),
        name: f.companyName({ isUnique: true }),
        originalId: f.uuid(),
        provider: f.valuesFromArray({
          values: Object.values(Provider),
        }),
        countries: f.default({ defaultValue: ["IT"] }),
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
        deletedAt: f.default({ defaultValue: null }),
      },
      with: {
        transaction_table: 500,
      },
    },
    transaction_table: {
      columns: {
        amount: f.int({ minValue: 0 }),
        currency: f.default({ defaultValue: "EUR" }),
        description: f.loremIpsum({ sentencesCount: 1 }),
        note: f.loremIpsum({ sentencesCount: 2 }),
        rawId: f.uuid(),
        userId: f.default({ defaultValue: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD" }),
        deletedAt: f.default({ defaultValue: null }),
      },
    },
    tag_table: {
      columns: {
        userId: f.default({ defaultValue: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD" }),
        deletedAt: f.default({ defaultValue: null }),
      },
    },
  }));

  await db.$client.end();
}

await main();
