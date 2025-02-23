"server-only";

import { and, asc, eq, getTableColumns, isNull, or } from "drizzle-orm";

import type { DBClient } from "..";
import { type ToggleAccountType } from "~/lib/validators";
import { db } from "..";
import { account_table as accountSchema } from "../schema/accounts";
import {
  budget_table as budgetSchema,
  budget_to_category_table as budgetToCategoryTable,
  budget_to_tag_table as budgetToTagTable,
} from "../schema/budgets";
import { category_table as categorySchema } from "../schema/categories";
import { connection_table as connectionSchema } from "../schema/open-banking";
import { tag_table as tagSchema } from "../schema/transactions";

export const QUERIES = {
  getAccountsForUser: function (userId: string, client: DBClient = db) {
    return client
      .select()
      .from(accountSchema)
      .where(eq(accountSchema.userId, userId))
      .orderBy(accountSchema.name);
  },
  getDisabledAccountsForUser: function (userId: string, client: DBClient = db) {
    return client
      .select({ rawId: accountSchema.rawId })
      .from(accountSchema)
      .where(
        and(eq(accountSchema.userId, userId), eq(accountSchema.enabled, false)),
      );
  },
  getAccountsWithConnectionsForUser: function (
    userId: string,
    client: DBClient = db,
  ) {
    return client.query.connection_table.findMany({
      with: {
        accounts: { orderBy: asc(accountSchema.createdAt) },
        institution: true,
      },
      where: eq(connectionSchema.userId, userId),
    });
  },

  getCategoriesWithBudgets: async function (
    userId: string,
    year: number,
    client: DBClient = db,
  ) {
    // Recupera tutte le categorie dell'utente
    const categories = await client
      .select()
      .from(categorySchema)
      .where(
        or(eq(categorySchema.userId, userId), isNull(categorySchema.userId)),
      );

    // Recupera tutti i budget per l'utente
    const budgets = await client
      .select({
        id: budgetSchema.id,
        categoryId: budgetToCategoryTable.categoryId,
        amount: budgetSchema.amount,
        period: budgetSchema.period,
        startDate: budgetSchema.startDate,
        endDate: budgetSchema.endDate,
      })
      .from(budgetSchema)
      .leftJoin(
        budgetToCategoryTable,
        eq(budgetSchema.id, budgetToCategoryTable.budgetId),
      )
      .where(and(eq(budgetSchema.userId, userId)));

    // Creiamo una mappa {categoryId: { mese: budget } }
    const budgetMap = new Map<string, Record<number, number>>();

    budgets.forEach((budget) => {
      if (!budget.categoryId) return; // Caso raro in cui budget non è collegato a nessuna categoria
      const categoryBudgets = budgetMap.get(budget.categoryId) ?? {};

      for (let month = 1; month <= 12; month++) {
        const inRange =
          new Date(budget.startDate).getFullYear() <= year &&
          new Date(budget.endDate).getFullYear() >= year &&
          new Date(budget.startDate).getMonth() + 1 <= month &&
          new Date(budget.endDate).getMonth() + 1 >= month;

        categoryBudgets[month] = inRange
          ? Number(budget.amount)
          : (categoryBudgets[month] ?? 0);
      }

      budgetMap.set(budget.categoryId, categoryBudgets);
    });

    // Costruisci il risultato finale
    return categories.map((category) => ({
      ...category,
      budgets: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        amount: budgetMap.get(category.id)?.[i + 1] ?? 0, // Default a 0 se non c'è budget
      })),
    }));
  },
  getBudgetWithCategoryForUser: function (
    userId: string,
    client: DBClient = db,
  ) {
    return client
      .select({
        ...getTableColumns(budgetSchema),
        category: categorySchema,
      })
      .from(budgetSchema)
      .leftJoin(
        budgetToCategoryTable,
        eq(budgetSchema.id, budgetToCategoryTable.categoryId),
      )
      .leftJoin(
        categorySchema,
        eq(budgetToCategoryTable.categoryId, categorySchema.id),
      )
      .where(eq(budgetSchema.userId, userId))
      .orderBy(budgetSchema.name);
  },
  getBudgetWithTagForUser: function (userId: string, client: DBClient = db) {
    return client
      .select({
        ...getTableColumns(budgetSchema),
        tag: tagSchema,
      })
      .from(budgetSchema)
      .leftJoin(
        budgetToTagTable,
        eq(budgetSchema.id, budgetToTagTable.budgetId),
      )
      .leftJoin(tagSchema, eq(budgetToTagTable.tagId, tagSchema.id))
      .where(eq(budgetSchema.userId, userId))
      .orderBy(budgetSchema.name);
  },
};

export const MUTATIONS = {
  toggleAccount: function (params: ToggleAccountType, client: DBClient = db) {
    return client
      .update(accountSchema)
      .set({ enabled: params.enabled })
      .where(eq(accountSchema.id, params.id));
  },
};
