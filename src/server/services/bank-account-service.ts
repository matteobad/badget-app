import type { getBankAccountsSchema } from "~/shared/validators/bank-account.schema";
import type z from "zod/v4";

import { getBankAccountsQuery } from "../domain/bank-account/queries";

export async function getBankAccounts(
  input: z.infer<typeof getBankAccountsSchema>,
  userId: string,
) {
  return await getBankAccountsQuery(input, userId);
}
