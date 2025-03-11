import "dotenv/config";

import { createId } from "@paralleldrive/cuid2";
import { reset, seed } from "drizzle-seed";

import type { CategoryType } from "./schema/enum";
import { db, schema } from ".";
import { AccountType, CONNECTION_STATUS, Provider } from "./schema/enum";

// Define hardcoded icons per type
const TYPE_ICONS: Record<string, string> = {
  income: "DollarSign",
  expense: "ShoppingCart",
  savings: "PiggyBank",
  investment: "TrendingUp",
};

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

  // Root categories (Level 0)
  const rootCategories = ["income", "expense", "savings", "investment"].map(
    (type) => ({
      id: createId(),
      userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
      type: type as CategoryType,
      name: type.charAt(0).toUpperCase() + type.slice(1), // Capitalized
      slug: type,
      icon: TYPE_ICONS[type],
      parentId: null,
      color: "#666666",
    }),
  );

  // Subcategories (Level 1)
  const subCategories = [
    { parentType: "income", name: "Salary", icon: "briefcase" },
    { parentType: "income", name: "Freelance", icon: "pen-toll" },
    { parentType: "expense", name: "Rent", icon: "home" },
    { parentType: "expense", name: "Groceries", icon: "shopping-bag" },
    { parentType: "expense", name: "Transport", icon: "bus" },
    { parentType: "savings", name: "Emergency Fund", icon: "shield" },
    { parentType: "savings", name: "Vacation Fund", icon: "plane" },
    { parentType: "investment", name: "Stocks", icon: "bar-chart" },
    { parentType: "investment", name: "Crypto", icon: "bit-coin" },
  ].map((cat) => ({
    id: createId(),
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
    type: cat.parentType as CategoryType,
    name: cat.name,
    slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
    icon: cat.icon,
    parentId: rootCategories.find((c) => c.type === cat.parentType)?.id ?? null,
    color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`,
  }));

  // Insert categories into the database
  const inserted = await db
    .insert(schema.category_table)
    .values([...rootCategories, ...subCategories])
    .returning({ id: schema.account_table.id });

  await seed(db, rest).refine((f) => ({
    category_table: { count: 1 },
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
        categoryId: f.weightedRandom([
          {
            weight: 0.5,
            value: f.valuesFromArray({ values: inserted.map((c) => c.id) }),
          },
          { weight: 0.5, value: f.default({ defaultValue: null }) },
        ]),
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
