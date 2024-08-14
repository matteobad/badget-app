"use server";

import { logger } from "~/lib/utils";
import { db, schema } from "~/server/db";

type GetAccountParams = {
  countryCode: string;
  query?: string;
};

export async function getInstitutions({
  countryCode,
  query,
}: GetAccountParams) {
  try {
    const results = await db.select().from(schema.institutions);

    return results.filter((item) =>
      item.name?.toLowerCase().includes(query?.toLowerCase() ?? ""),
    );
  } catch (error) {
    logger(error instanceof Error ? error.message : String(error));
    return [];
  }
}
