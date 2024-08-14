"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import type { FormState } from "~/lib/validators";
import { CreateWorkSchema } from "~/lib/validators";

// import { db, schema } from "../db";
// import { ContributionContributor } from "../db/schema/pension-funds";

export async function createWorkAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = auth();

  // Authenticate request
  if (!session.userId) {
    return {
      message: "You must be logged in to create a post",
    };
  }

  const data = Object.fromEntries(formData);
  const parsed = CreateWorkSchema.parse(data);
  console.log(parsed);

  // Return early if the form data is invalid
  // if (!parsed.success) {
  //   const fields: Record<string, string> = {};
  //   for (const key of Object.keys(data)) {
  //     fields[key] = data[key]?.toString() ?? "";
  //   }

  //   return {
  //     message: "Invalid form data",
  //     fields,
  //     errors: parsed.error.flatten().fieldErrors,
  //   };
  // }

  try {
    // Mutate data
    // const { ...values } = parsed;

    // await db.transaction(async (tx) => {
    //   const [inserted] = await tx
    //     .insert(schema.pensionAccounts)
    //     .values({
    //       ...values,
    //       userId: session.userId,
    //     })
    //     .returning({ insertedId: schema.pensionAccounts.id });

    //   if (!inserted?.insertedId) {
    //     tx.rollback();
    //     return;
    //   }

    //   await tx.insert(schema.pensionContributions).values({
    //     pensionAccountId: inserted.insertedId,
    //     amount: baseContribution?.replaceAll(".", "").replace(",", "."),
    //     contributor: ContributionContributor.EMPLOYEE,
    //     consolidatedAt: new Date(),
    //     date: new Date(),
    //   });
    // });

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
}
