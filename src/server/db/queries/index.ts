"server-only";

import {
  and,
  arrayContains,
  asc,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNull,
  or,
} from "drizzle-orm";

import type {
  DB_AttachmentInsertType,
  DB_TransactionInsertType,
} from "../schema/transactions";
import { type ToggleAccountType } from "~/lib/validators";
import { db } from "..";
import { account_table as accountSchema } from "../schema/accounts";
import {
  budget_table as budgetSchema,
  budget_to_category_table as budgetToCategoryTable,
  budget_to_tag_table as budgetToTagTable,
} from "../schema/budgets";
import { category_table as categorySchema } from "../schema/categories";
import {
  connection_table as connectionSchema,
  institution_table as institutionSchema,
} from "../schema/open-banking";
import {
  attachment_table as attachmentSchema,
  tag_table as tagSchema,
  transaction_table as transactionSchema,
  transaction_to_tag_table as transactionToTagSchema,
} from "../schema/transactions";
import { type DBClient } from "../utils";

export const QUERIES = {
  // institutions
  getInstitutionsForCountry: function (
    countryCode: string,
    client: DBClient = db,
  ) {
    return client
      .select()
      .from(institutionSchema)
      .where(arrayContains(institutionSchema.countries, [countryCode]))
      .orderBy(desc(institutionSchema.popularity));
  },
  getInstitutionById: function (institutionId: string, client: DBClient = db) {
    return client
      .select()
      .from(institutionSchema)
      .where(eq(institutionSchema.id, institutionId));
  },

  getConnectionsforUser: function (userId: string, client: DBClient = db) {
    return client
      .select()
      .from(connectionSchema)
      .where(eq(connectionSchema.userId, userId));
  },
  getConnectionByKey: function (key: string, client: DBClient = db) {
    return client
      .select()
      .from(connectionSchema)
      .where(eq(connectionSchema.referenceId, key));
  },

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

  getCategoriesForUser: function (userId: string, client: DBClient = db) {
    return client
      .select()
      .from(categorySchema)
      .where(
        or(eq(categorySchema.userId, userId), isNull(categorySchema.userId)),
      )
      .orderBy(categorySchema.name);
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
  createTransaction: function (
    data: DB_TransactionInsertType,
    client: DBClient = db,
  ) {
    return client
      .insert(transactionSchema)
      .values(data)
      .returning({ insertedId: transactionSchema.id });
  },
  deleteTransaction: function (id: string, client: DBClient = db) {
    return client.delete(transactionSchema).where(eq(transactionSchema.id, id));
  },

  updateTagsOnTransaction: async function (
    tags: string[],
    transactionId: string,
    userId: string,
    client: DBClient,
  ) {
    const existingTags = await client
      .select({
        id: transactionToTagSchema.tagId,
        text: tagSchema.text,
      })
      .from(transactionToTagSchema)
      .innerJoin(tagSchema, eq(transactionToTagSchema.tagId, tagSchema.id))
      .where(eq(transactionToTagSchema.transactionId, transactionId));

    const existingTagNames = existingTags.map((t) => t.text);

    // Determine tags to add and remove
    const tagsToAdd = tags.filter((name) => !existingTagNames.includes(name));
    const tagsToRemove = existingTags.filter((tag) => !tags.includes(tag.text));

    let newTagIds: string[] = [];

    // Create tags if they don’t exist
    if (tagsToAdd.length > 0) {
      const existingTagRecords = await client
        .select({ id: tagSchema.id, name: tagSchema.text })
        .from(tagSchema)
        .where(inArray(tagSchema.text, tagsToAdd));

      const existingTagMap = new Map(
        existingTagRecords.map((t) => [t.name, t.id]),
      );

      const tagsToInsert = tagsToAdd.filter(
        (name) => !existingTagMap.has(name),
      );

      if (tagsToInsert.length > 0) {
        const insertedTags = await client
          .insert(tagSchema)
          .values(tagsToInsert.map((text) => ({ text, userId })))
          .returning({ id: tagSchema.id, text: tagSchema.text });

        insertedTags.forEach(({ id, text }) => existingTagMap.set(text, id));
      }

      newTagIds = tagsToAdd.map((name) => existingTagMap.get(name)!);
    }

    // Insert new tag associations
    if (newTagIds.length > 0) {
      await client.insert(transactionToTagSchema).values(
        newTagIds.map((tagId) => ({
          transactionId,
          tagId,
        })),
      );
    }

    // Remove old tag associations
    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag) => tag.id);

      await client
        .delete(transactionToTagSchema)
        .where(
          and(
            eq(transactionToTagSchema.transactionId, transactionId),
            inArray(transactionToTagSchema.tagId, tagIdsToRemove),
          ),
        );

      // Delete tags if they are no longer used
      const unusedTags = await client
        .select({ id: transactionToTagSchema.tagId })
        .from(transactionToTagSchema)
        .where(inArray(transactionToTagSchema.tagId, tagIdsToRemove));

      const unusedTagIds = tagIdsToRemove.filter(
        (id) => !unusedTags.some((t) => t.id === id),
      );

      if (unusedTagIds.length > 0) {
        await client
          .delete(tagSchema)
          .where(inArray(tagSchema.id, unusedTagIds));
      }
    }
  },

  createAttachment: function (
    attachment: DB_AttachmentInsertType,
    client: DBClient = db,
  ) {
    return client.insert(attachmentSchema).values(attachment).returning();
  },
  updateAttachment: function (
    attachment: Partial<DB_AttachmentInsertType>,
    client: DBClient = db,
  ) {
    return client
      .update(attachmentSchema)
      .set(attachment)
      .where(
        and(
          eq(attachmentSchema.id, attachment.id!),
          eq(attachmentSchema.userId, attachment.userId!),
        ),
      );
  },
  deleteAttachment: function (
    id: string,
    userId: string,
    client: DBClient = db,
  ) {
    return client
      .delete(attachmentSchema)
      .where(
        and(eq(attachmentSchema.id, id), eq(attachmentSchema.userId, userId)),
      );
  },

  toggleAccount: function (params: ToggleAccountType, client: DBClient = db) {
    return client
      .update(accountSchema)
      .set({ enabled: params.enabled })
      .where(eq(accountSchema.id, params.id));
  },
};

export function createTransactionMutation(data: DB_TransactionInsertType) {
  return db.insert(transactionSchema).values(data);
}
