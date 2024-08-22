import { revalidateTag } from "next/cache";
import { addDays, startOfYear, subYears } from "date-fns";
import { and, eq, sql } from "drizzle-orm";
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
  upsertBankConnectionsSchema,
  upsertCategoryBudgetSchema,
  upsertCategorySchema,
} from "~/lib/validators";
import { type editBankTransactionSchema } from "~/lib/validators";
import { buildConflictUpdateColumns } from "~/server/db/utils";
import { getAccessValidForDays } from "~/server/providers/gocardless/utils";
import { db, schema } from "..";
import { ConnectionStatus, Provider } from "../schema/enum";
import { bankAccounts, bankConnections } from "../schema/open-banking";

// Bank Connection
type UpsertBankConnectionsAndAccountsPayload = z.infer<
  typeof upsertBankConnectionsSchema
>;

export async function upsertBankConnections(
  payload: UpsertBankConnectionsAndAccountsPayload,
) {
  await db.transaction(async (tx) => {
    const { accounts, ...connection } = payload;
    const updatedAt = new Date();

    // upsert connection
    const upserted = await tx
      .insert(bankConnections)
      .values({ ...connection })
      .onConflictDoUpdate({
        target: bankConnections.id,
        set: { ...connection, updatedAt },
      })
      .returning({ id: bankConnections.id });

    if (!upserted[0]?.id) tx.rollback();

    // upsert accounts
    await tx
      .insert(bankAccounts)
      .values(accounts)
      .onConflictDoUpdate({
        target: bankAccounts.accountId,
        set: buildConflictUpdateColumns(bankAccounts, [
          "balance",
          "currency",
          "type",
          "updatedAt", // TODO: update this value
        ]),
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
    });
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

type EditTransactionPayload = z.infer<typeof editBankTransactionSchema>;

export async function editBankTransaction({
  id,
  categoryId,
  userId,
}: EditTransactionPayload) {
  console.log(id, categoryId);
  await db
    .update(schema.bankTransactions)
    .set({
      categoryId,
      // amount,
      // description,
    })
    .where(
      and(
        eq(schema.bankTransactions.id, id!),
        eq(schema.bankTransactions.userId, userId),
      ),
    );

  revalidateTag(`bank_transactions_${userId}`);
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

  // invalidate cache key for given user
  // NOTE: works only if payload is from same user!
  revalidateTag(`bank_transactions_${payload[0]?.userId}`);
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

type DeleteCategoryPayload = z.infer<typeof deleteCategorySchema> & {
  userId: string;
};

export async function deleteCategory({
  categoryId,
  name,
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

    console.log(name);

    await tx
      .delete(schema.categories)
      .where(
        and(
          eq(schema.categories.id, categoryId),
          eq(schema.categories.name, name),
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
