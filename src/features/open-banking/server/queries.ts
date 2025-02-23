"server-only";

import { arrayContains, asc, desc, eq } from "drizzle-orm";

import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import {
  connection_table,
  institution_table,
} from "~/server/db/schema/open-banking";

export const getInstitutionsForCountry = (countryCode: string) => {
  return db
    .select()
    .from(institution_table)
    .where(arrayContains(institution_table.countries, [countryCode]))
    .orderBy(desc(institution_table.popularity));
};

export const getInstitutionById = (institutionId: string) => {
  return db
    .select()
    .from(institution_table)
    .where(eq(institution_table.id, institutionId));
};

export const getConnectionsforUser = (userId: string) => {
  return db
    .select()
    .from(connection_table)
    .where(eq(connection_table.userId, userId));
};

export const getConnectionByKey = (key: string) => {
  return db
    .select()
    .from(connection_table)
    .where(eq(connection_table.referenceId, key));
};

export const getConnectionsWithAccountsForUser = (userId: string) => {
  return db.query.connection_table.findMany({
    with: {
      accounts: { orderBy: asc(account_table.createdAt) },
      institution: true,
    },
    where: eq(connection_table.userId, userId),
  });
};
