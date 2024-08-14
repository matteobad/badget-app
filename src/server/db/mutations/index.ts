import { addDays } from "date-fns";

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
    await db.transaction(async (tx) => {
      const insertedBankAccount = await tx
        .insert(schema.bankAccounts)
        .values({
          userId,
          bankConnectionId: bankConnection[0]?.insertedId,
          accountId: bankAccount.account_id,
          name: bankAccount.name,
          type: "CREDIT",
          enabled: bankAccount.enabled,
        })
        .onConflictDoUpdate({
          target: schema.bankAccounts.accountId,
          set: {
            name: bankAccount.name,
            enabled: bankAccount.enabled,
            updatedAt,
          },
        })
        .returning({ id: schema.bankAccounts.id });

      if (!insertedBankAccount[0]) tx.rollback();

      await tx
        .insert(schema.bankAccountBalances)
        .values({
          bankAccountId: insertedBankAccount[0]!.id,
          amount: parseFloat(bankAccount.balance),
          currency: bankAccount.currency,
        })
        .onConflictDoUpdate({
          target: schema.bankAccountBalances.bankAccountId,
          set: {
            amount: parseFloat(bankAccount.balance),
            currency: bankAccount.currency,
            updatedAt,
          },
        });
    });
  }
}
