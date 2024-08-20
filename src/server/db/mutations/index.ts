import { addDays, startOfMonth, startOfYear, subYears } from "date-fns";
import { and, eq, inArray, or, sql, SQL } from "drizzle-orm";
import { type z } from "zod";

import type { BudgetPeriod, CategoryType } from "../schema/enum";
import type {
  createBankAccountSchema,
  updateCategorySchema,
  upsertCategoryBudgetSchema,
  upsertCategorySchema,
} from "~/lib/validators";
import { editBankTransactionSchema } from "~/lib/validators";
import { getAccessValidForDays } from "~/server/providers/gocardless/utils";
import { db, schema } from "..";
import { ConnectionStatus, Provider } from "../schema/enum";

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
    });
}

type EditTransactionPayload = z.infer<typeof editBankTransactionSchema>;

export async function editBankTransaction({
  categoryId,
  amount,
  description,
}: EditTransactionPayload) {
  return await db.update(schema.bankTransactions).set({
    categoryId,
    amount,
    description,
  });
}

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
      .insert(schema.categories)
      .values({
        name,
        macro,
        type: type as CategoryType,
        icon,
        color,
        userId,
      })
      .onConflictDoUpdate({
        target: [schema.categories.userId, schema.categories.name],
        set: {
          macro,
          type: type as CategoryType,
          icon,
          color,
        },
      })
      .returning({ insertedId: schema.categories.id });

    if (!inserted[0]?.insertedId) return tx.rollback();

    await tx.insert(schema.categoryBudgets).values({
      budget: budgets[0]?.budget,
      period: budgets[0]?.period as BudgetPeriod,
      activeFrom: startOfYear(subYears(new Date(), 2)), // first budget should compreend everything
      categoryId: inserted[0].insertedId,
      userId: userId,
    });
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
    .update(schema.categories)
    .set({
      id,
      name,
      macro,
      type: type as CategoryType,
      icon,
      color,
    })
    .where(
      and(eq(schema.categories.id, id!), eq(schema.categories.userId, userId)),
    );
}

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

type DeleteCategoryPayload = {
  categoryId: number;
  userId: string;
};

export async function deleteCategory({
  categoryId,
  userId,
}: DeleteCategoryPayload) {
  return await db.transaction(async (tx) => {
    await tx
      .delete(schema.categoryBudgets)
      .where(eq(schema.categoryBudgets.categoryId, categoryId));

    const defaultCategory = await tx
      .select({
        id: schema.categories.id,
      })
      .from(schema.categories)
      .where(
        and(
          eq(schema.categories.userId, userId),
          eq(schema.categories.name, "uncategorized"),
        ),
      );

    if (!defaultCategory[0]?.id) return tx.rollback();

    await tx
      .update(schema.bankTransactions)
      .set({
        categoryId: defaultCategory[0].id,
      })
      .where(eq(schema.bankTransactions.categoryId, categoryId));

    await tx
      .delete(schema.categories)
      .where(eq(schema.categories.id, categoryId));
  });
}
