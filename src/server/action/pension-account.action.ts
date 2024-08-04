"use server";

import { revalidatePath } from "next/cache";
import { flattenValidationErrors } from "next-safe-action";

import { authActionClient } from "~/lib/safe-action";
import { CreatePensionAccountSchema } from "~/lib/validators";
import { db, schema } from "../db";
import { ContributionContributor } from "../db/schema/pension-funds";

export const createPensionAccountFormAction = authActionClient
  .schema(CreatePensionAccountSchema, {
    handleValidationErrorsShape: (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput, ctx }) => {
    try {
      // Mutate data
      const { baseContribution, ...values } = parsedInput;

      await db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(schema.pensionAccounts)
          .values({
            ...values,
            userId: ctx.userId,
          })
          .returning({ insertedId: schema.pensionAccounts.id });

        if (!inserted?.insertedId) {
          tx.rollback();
          return;
        }

        await tx.insert(schema.pensionAccountContributions).values({
          pensionAccountId: inserted.insertedId,
          amount: baseContribution?.replaceAll(".", "").replace(",", "."),
          contributor: ContributionContributor.EMPLOYEE,
          consolidated_at: new Date(),
          date: new Date(),
        });
      });

      // Invalidate cache
      revalidatePath("/savings");

      // Return success message
      return { message: "Pension account created" };
    } catch (e) {
      // Return error message
      console.error(e);
      return {
        message: "Failed to create pension account",
      };
    }
  });

// export async function createPensionAccountAction(
//   _prevState: FormState,
//   formData: FormData,
// ): Promise<FormState> {
//   const session = auth();

//   // Authenticate request
//   if (!session.userId) {
//     return {
//       message: "You must be logged in to create a post",
//     };
//   }

//   const data = Object.fromEntries(formData);
//   const parsed = CreatePensionAccountSchema.parse(data);
//   console.log(parsed);

//   // Return early if the form data is invalid
//   // if (!parsed.success) {
//   //   const fields: Record<string, string> = {};
//   //   for (const key of Object.keys(data)) {
//   //     fields[key] = data[key]?.toString() ?? "";
//   //   }

//   //   return {
//   //     message: "Invalid form data",
//   //     fields,
//   //     errors: parsed.error.flatten().fieldErrors,
//   //   };
//   // }

// }
