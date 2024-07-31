import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { ShieldCheckIcon } from "lucide-react";

import { db, schema } from "~/server/db";
import { AddPensionAccountDialog } from "./add-pension-account";

async function getPensionAccountsByUserId() {
  const session = auth();

  if (!session?.userId) {
    throw new Error("UNAUTHORIZED");
  }

  return await db
    .select()
    .from(schema.pensionAccounts)
    .where(eq(schema.pensionAccounts.userId, session.userId));
}

async function findAllPensionFunds() {
  return await db.query.pensionFunds.findMany({
    with: {
      investmentsBranches: true,
    },
  });
}

export async function PensionAccountList() {
  const pensionAccounts = await getPensionAccountsByUserId();
  const pensionFundsPromise = findAllPensionFunds();

  if (pensionAccounts.length === 0) {
    return (
      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-6 pt-6">
        <ShieldCheckIcon className="h-16 w-16 rounded-full bg-slate-100 p-4" />
        <div className="flex flex-col items-center gap-2">
          <p className="text-xl font-bold">No pension accounts yet</p>
          <p className="text-sm text-slate-500">
            Let&apos;s start by adding a pension fund
          </p>
        </div>
        <AddPensionAccountDialog pensionFundsPromise={pensionFundsPromise} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 py-6">
      <div className="self-end">
        <AddPensionAccountDialog pensionFundsPromise={pensionFundsPromise} />
      </div>
      {pensionAccounts.map((account) => {
        return <span key={account.id}>{account.id}</span>;
      })}
    </div>
  );
}

export function AccountCard(props: {
  account: typeof schema.accounts.$inferSelect;
}) {
  return (
    <div className="flex flex-row rounded-lg bg-muted p-4">
      <div className="flex-grow">
        <h2 className="text-2xl font-bold text-primary">
          {props.account.name}
        </h2>
      </div>
    </div>
  );
}
