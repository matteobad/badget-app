import { type z } from "zod";

import { type CreateTransactionFormSchema } from "~/lib/validators/transactions";
import { db } from "..";
import { transactions } from "../schema/transactions";

// export async function deleteTransactionMutation(
//   params: z.infer<typeof deletePostSchema>,
// ) {
//   await db.delete(schema.posts).where(eq(schema.posts.id, params.id));
// }

export async function createTransactionMutation(
  params: z.infer<typeof CreateTransactionFormSchema>,
) {
  await db.insert(transactions).values(params);
}
