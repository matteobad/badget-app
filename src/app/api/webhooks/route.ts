import { NextResponse } from "next/server";
import { isNull, sql } from "drizzle-orm";

import { db, schema } from "~/server/db";
import { bankTransactions } from "~/server/db/schema/open-banking";

export async function GET(_req: Request) {
  // get all connections
  const categories = await db.select().from(schema.category);

  const transactions = await db
    .select({
      id: bankTransactions.id,
      accountId: sql<string>`SPLIT_PART(${bankTransactions.accountId}, '-', '1')`,
      amount: bankTransactions.amount,
      currency: bankTransactions.currency,
      date: sql<string>`TO_CHAR(${bankTransactions.date}, 'YYYY-MM-DD')`,
      description: sql<string>`CONCAT(${bankTransactions.name}, ' - ', ${bankTransactions.description})`,
    })
    .from(bankTransactions)
    .where(isNull(bankTransactions.categoryId))
    .limit(10);

  const prompt = transactions
    .map((t) => Object.values(t).join() + ";")
    .join(",");

  // const { object } = await findMatchingCategory(
  //   prompt,
  //   categories.map((c) => c.name),
  // );

  // const result = [];
  // for (const partialObject of object.transaction) {
  //   if (partialObject) {
  //     const transaction = transactions.find(
  //       (t) => t.id.toString() === partialObject.id,
  //     );
  //     result.push({
  //       description: transaction?.description,
  //       category: partialObject.category,
  //     });
  //   }
  // }

  return NextResponse.json({ ok: true, data: prompt });
}
