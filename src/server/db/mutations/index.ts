import { addDays, startOfYear, subYears } from "date-fns";
import { and, eq, isNull, sql } from "drizzle-orm";
import { type z } from "zod";

import type {
  BankAccountType,
  BudgetPeriod,
  CategoryType,
} from "../schema/enum";
import type {
  createBankAccountSchema,
  deleteCategorySchema,
  insertBankTransactionSchema,
  toggleBankAccountSchema,
  updateBankAccountSchema,
  updateCategorySchema,
  upsertBankConnectionSchema,
  upsertCategoryBudgetSchema,
  upsertCategoryBulkSchema,
  upsertCategorySchema,
} from "~/lib/validators";
import { tokenize } from "~/lib/jobs/tokenize";
import { type updateBankTransactionSchema } from "~/lib/validators";
import { buildConflictUpdateColumns } from "~/server/db/utils";
import { getAccessValidForDays } from "~/server/providers/gocardless/utils";
import { db, schema } from "..";
import { bankAccounts, bankConnections } from "../schema/connections";
import { ConnectionStatus, Provider } from "../schema/enum";

// Bank Connection
export async function upsertBankConnections(
  payload: z.infer<typeof upsertBankConnectionSchema>,
) {
  return await db.transaction(async (tx) => {
    const { accounts, connection } = payload;
    const updatedAt = new Date();

    // upsert connection
    const upserted = await tx
      .insert(bankConnections)
      .values({ ...connection })
      .onConflictDoUpdate({
        target: [bankConnections.institutionId, bankConnections.userId],
        set: { ...connection, updatedAt },
      })
      .returning({ id: bankConnections.id });

    if (!upserted[0]?.id) tx.rollback();

    // upsert accounts
    return await tx
      .insert(bankAccounts)
      .values(
        accounts.map((account) => ({
          ...account,
          bankConnectionId: upserted[0]?.id,
        })),
      )
      .onConflictDoUpdate({
        target: bankAccounts.accountId,
        set: buildConflictUpdateColumns(bankAccounts, [
          "bankConnectionId",
          "balance",
          "currency",
          "type",
          "updatedAt", // TODO: update this value
        ]),
      })
      .returning({
        id: bankAccounts.id,
        accountId: bankAccounts.accountId,
        manual: bankAccounts.manual,
      });
  });
}

// Bank Account
type CreateBankAccountsPayload = {
  accounts: {
    account_id: string;
    institution_id: string;
    logo_url: string;
    name: string;
    bank_name: string;
    balance: string;
    currency: string;
    enabled: boolean;
    // type?: BankAccountType;
  }[];
  referenceId?: string | null;
  userId: string;
  provider: Provider;
};

export async function createBankAccounts({
  accounts,
  referenceId,
  userId,
  provider,
}: CreateBankAccountsPayload) {
  // Get first account to create a bank connection
  const account = accounts?.at(0);

  if (!account) {
    return;
  }

  const updatedAt = new Date();

  // NOTE: GoCardLess connection expires after 90-180 days
  const expiresAt =
    provider === Provider.GOCARDLESS
      ? addDays(
          new Date(),
          getAccessValidForDays({ institutionId: account.institution_id }),
        )
      : undefined;

  const bankConnection = await db
    .insert(schema.bankConnections)
    .values({
      institutionId: account.institution_id,
      name: account.bank_name,
      logoUrl: account.logo_url,
      provider,
      referenceId,
      expiresAt,
      userId,
      status: ConnectionStatus.CONNECTED,
    })
    .onConflictDoUpdate({
      target: [
        schema.bankConnections.institutionId,
        schema.bankConnections.userId,
      ],
      set: {
        name: account.bank_name,
        logoUrl: account.logo_url,
        expiresAt,
        updatedAt,
      },
    })
    .returning({ insertedId: schema.bankConnections.id });

  for (const bankAccount of accounts) {
    await db
      .insert(schema.bankAccounts)
      .values({
        userId,
        bankConnectionId: bankConnection[0]?.insertedId,
        institutionId: bankAccount.institution_id,
        accountId: bankAccount.account_id,
        balance: bankAccount.balance,
        currency: bankAccount.currency,
        name: bankAccount.name,
        type: "CREDIT", // TODO: map this field
        enabled: bankAccount.enabled,
      })
      .onConflictDoUpdate({
        target: schema.bankAccounts.accountId,
        set: {
          balance: bankAccount.balance,
          currency: bankAccount.currency,
          name: bankAccount.name,
          enabled: bankAccount.enabled,
          updatedAt,
        },
      });
  }
}

type CreateBankAccountPayload = z.infer<typeof createBankAccountSchema> & {
  userId: string;
};

export async function createBankAccount({
  name,
  balance,
  currency,
  userId,
}: CreateBankAccountPayload) {
  const bankConnection = await db
    .insert(schema.bankConnections)
    .values({
      name: "Manual",
      provider: Provider.NONE,
      institutionId: "MANUAL",
      userId,
      status: ConnectionStatus.UNKNOWN,
    })
    .onConflictDoUpdate({
      target: [
        schema.bankConnections.institutionId,
        schema.bankConnections.userId,
      ],
      set: {
        updatedAt: new Date(),
      },
    })
    .returning({ insertedId: schema.bankConnections.id });

  return await db
    .insert(schema.bankAccounts)
    .values({
      name,
      balance,
      currency,
      userId,
      bankConnectionId: bankConnection[0]?.insertedId,
    })
    .onConflictDoUpdate({
      target: schema.bankAccounts.id,
      set: {
        name,
        balance,
        currency,
      },
    })
    .returning({ id: schema.bankAccounts.id });
}

type UpdateBankAccountPayload = z.infer<typeof updateBankAccountSchema> & {
  userId: string;
};

export async function updateBankAccount({
  id,
  name,
  type,
  balance,
  currency,
  userId,
}: UpdateBankAccountPayload) {
  return await db
    .update(schema.bankAccounts)
    .set({
      name,
      type: type as BankAccountType,
      balance,
      currency,
      userId,
    })
    .where(
      and(
        eq(schema.bankAccounts.userId, userId),
        eq(schema.bankAccounts.id, id!),
      ),
    );
}

type ToggleBankAccountPayload = z.infer<typeof toggleBankAccountSchema> & {
  userId: string;
};

export async function toggleBankAccount({
  id,
  enabled,
  userId,
}: ToggleBankAccountPayload) {
  return await db
    .update(schema.bankAccounts)
    .set({
      enabled,
    })
    .where(
      and(
        eq(schema.bankAccounts.userId, userId),
        eq(schema.bankAccounts.id, id!),
      ),
    );
}

export async function updateBankTransaction({
  id,
  categoryId,
  userId,
}: z.infer<typeof updateBankTransactionSchema>) {
  const edited = await db
    .update(schema.bankTransactions)
    .set({
      categoryId,
    })
    .where(
      and(
        eq(schema.bankTransactions.id, id),
        eq(schema.bankTransactions.userId, userId),
      ),
    )
    .returning({
      description: schema.bankTransactions.description,
      categoryId: schema.bankTransactions.categoryId,
    });

  return edited;
}

export async function updateUncategorizedTransactions({
  categoryId,
  description,
  userId,
}: {
  categoryId: number;
  description: string;
  userId: string;
}) {
  return await db
    .update(schema.bankTransactions)
    .set({
      categoryId,
    })
    .where(
      and(
        eq(schema.bankTransactions.description, description),
        eq(schema.bankTransactions.userId, userId),
        isNull(schema.bankTransactions.categoryId),
      ),
    )
    .returning({ id: schema.bankTransactions.id });
}

export async function updateCategoryRules({
  categoryId,
  description,
}: {
  categoryId: number;
  description: string;
}) {
  return await db.transaction(async (tx) => {
    // get category rules
    const categoryRule = await tx
      .select({ id: schema.categoryRules.id })
      .from(schema.categoryRules)
      .where(eq(schema.categoryRules.categoryId, categoryId));

    if (!categoryRule[0]?.id) {
      console.error("unable to retrieve category rules", categoryId);
      return tx.rollback();
    }

    // create tokens from description
    const tokens = tokenize(description);

    // update category rule tokens
    return await tx
      .insert(schema.categoryRulesTokens)
      .values(
        tokens.map((token) => ({
          categoryRuleId: categoryRule[0]!.id,
          token,
          relevance: 1,
        })),
      )
      .onConflictDoUpdate({
        target: [
          schema.categoryRulesTokens.categoryRuleId,
          schema.categoryRulesTokens.token,
        ],
        set: {
          relevance: sql<number>`${schema.categoryRulesTokens.relevance} + 1`,
        },
      })
      .returning({
        categoryRuleId: schema.categoryRulesTokens.categoryRuleId,
        token: schema.categoryRulesTokens.token,
        relevance: schema.categoryRulesTokens.relevance,
      });
  });
}

// Bank Transactions
type InsertBankTransactionsPayload = z.infer<
  typeof insertBankTransactionSchema
>[];

export async function upsertTransactions(
  payload: InsertBankTransactionsPayload,
) {
  await db
    .insert(schema.bankTransactions)
    .values(payload)
    .onConflictDoUpdate({
      target: schema.bankTransactions.transactionId,
      set: buildConflictUpdateColumns(schema.bankTransactions, [
        "amount",
        "currency",
        "date",
        "description",
      ]),
    });
}

// Categories
type InsertCategoryPayload = z.infer<typeof upsertCategorySchema> & {
  userId: string;
};

export async function insertCategory({
  name,
  macro,
  type,
  icon,
  color,
  budgets,
  userId,
}: InsertCategoryPayload) {
  return await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(schema.category)
      .values({
        name,
        macro,
        type: type as CategoryType,
        icon,
        color,
        userId,
      })
      .onConflictDoUpdate({
        target: [schema.category.userId, schema.category.name],
        set: {
          macro,
          type: type as CategoryType,
          icon,
          color,
        },
      })
      .returning({ insertedId: schema.category.id });

    if (!inserted[0]?.insertedId) return tx.rollback();

    await tx
      .insert(schema.categoryRules)
      .values({
        categoryId: inserted[0]?.insertedId,
        userId,
      })
      .onConflictDoNothing();

    await tx.insert(schema.categoryBudgets).values({
      budget: budgets[0]?.budget,
      period: budgets[0]?.period as BudgetPeriod,
      activeFrom: startOfYear(subYears(new Date(), 2)), // first budget should compreend everything
      categoryId: inserted[0].insertedId,
      userId: userId,
    });
  });
}

export async function upsertCategoryBulk({
  categories,
}: z.infer<typeof upsertCategoryBulkSchema>) {
  return await db.transaction(async (tx) => {
    const results = [];

    for (const { budgets, ...category } of categories) {
      const inserted = await tx
        .insert(schema.category)
        .values(category)
        .onConflictDoUpdate({
          target: [schema.category.userId, schema.category.name],
          set: {
            name: category.name,
            macro: category.macro,
            type: category.type as CategoryType,
            icon: category.icon,
            color: category.color,
          },
        })
        .returning({ id: schema.category.id });

      if (!inserted[0]?.id) return tx.rollback();

      await tx
        .insert(schema.categoryRules)
        .values({
          categoryId: inserted[0]?.id,
          userId: category.userId,
        })
        .onConflictDoNothing();

      if (budgets.length !== 0) {
        await tx.insert(schema.categoryBudgets).values(
          budgets.map((b) => ({
            budget: b.budget,
            period: b.period,
            activeFrom: startOfYear(subYears(new Date(), 2)), // first budget should compreend everything
            categoryId: inserted[0]?.id!,
            userId: category.userId,
          })),
        );
      }

      results.push(...inserted);
    }

    return results;
  });
}

type EditCategoryPayload = z.infer<typeof updateCategorySchema> & {
  userId: string;
};

export async function editCategory({
  id,
  name,
  icon,
  color,
  macro,
  type,
  userId,
}: EditCategoryPayload) {
  await db
    .update(schema.category)
    .set({
      id,
      name,
      macro,
      type: type as CategoryType,
      icon,
      color,
    })
    .where(
      and(eq(schema.category.id, id!), eq(schema.category.userId, userId)),
    );
}

type DeleteCategoryPayload = z.infer<typeof deleteCategorySchema> & {
  userId: string;
};

export async function deleteCategory({
  categoryId,
  userId,
}: DeleteCategoryPayload) {
  return await db.transaction(async (tx) => {
    // delete category budget
    await tx
      .delete(schema.categoryBudgets)
      .where(eq(schema.categoryBudgets.categoryId, categoryId));

    // delete category rule
    const deletedRule = await tx
      .delete(schema.categoryRules)
      .where(eq(schema.categoryRules.categoryId, categoryId))
      .returning({ id: schema.categoryRules.id });

    // delete tokens associated with the rule
    if (deletedRule[0]?.id) {
      await tx
        .delete(schema.categoryRulesTokens)
        .where(
          eq(schema.categoryRulesTokens.categoryRuleId, deletedRule[0].id),
        );
    }

    // uncategorized all associated transactions
    await tx
      .update(schema.bankTransactions)
      .set({ categoryId: null })
      .where(eq(schema.bankTransactions.categoryId, categoryId));

    // delete actual category
    // TODO: maybe reprocess transactions agaist engine?
    // TODO: log more info about deleted stuff
    await tx
      .delete(schema.category)
      .where(
        and(
          eq(schema.category.id, categoryId),
          eq(schema.category.userId, userId),
        ),
      );
  });
}

// Category Budgets
type UpdateCategoryBudgetPayload = z.infer<
  typeof upsertCategoryBudgetSchema
> & {
  userId: string;
};

export async function upsertCategoryBudget({
  budgets,
  userId,
}: UpdateCategoryBudgetPayload) {
  const updatedAt = new Date();

  await db
    .insert(schema.categoryBudgets)
    .values(
      budgets.map((budget) => {
        return {
          ...budget,
          period: budget.period as BudgetPeriod,
          userId,
        };
      }),
    )
    .onConflictDoUpdate({
      target: schema.categoryBudgets.id,
      set: {
        budget: sql.raw(`excluded.${schema.categoryBudgets.budget}`),
        period: sql.raw(`excluded.${schema.categoryBudgets.period}`),
        activeFrom: sql.raw(`excluded.${schema.categoryBudgets.activeFrom}`),
        updatedAt,
      },
    });
}
