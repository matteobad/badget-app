import { type z } from "zod";

import { type TransactionInsertSchema } from "~/lib/validators/transactions";
import { db } from "..";
import { transaction_table } from "../schema/transactions";

// export async function deleteTransactionMutation(
//   params: z.infer<typeof deletePostSchema>,
// ) {
//   await db.delete(schema.posts).where(eq(schema.posts.id, params.id));
// }

export async function createTransactionMutation(
  params: z.infer<typeof TransactionInsertSchema>,
) {
  await db.insert(transaction_table).values(params);
}
