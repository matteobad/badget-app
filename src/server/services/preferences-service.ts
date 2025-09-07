import { eq } from "drizzle-orm";

import type { DBClient } from "../db";
import type {
  DB_OrganizationPreferences,
  DB_OrganizationPreferencesInsert,
} from "../db/schema/preferences";
import { organization_preferences_table } from "../db/schema/preferences";

export type AccountGroup = {
  id: string;
  name: string;
  order: number;
  accounts: string[]; // account ids
};

export type HybridPreferences = {
  baseCurrency: string;
  timezone: string;
  locale: string;
  weekStartDay: number;
  data: {
    account_groups?: AccountGroup[];
    [key: string]: unknown;
  };
};

const DEFAULT_ACCOUNT_GROUPS: AccountGroup[] = [
  { id: "liq", name: "Liquidità", order: 1, accounts: [] },
  { id: "inv", name: "Investimenti", order: 2, accounts: [] },
  { id: "debt_short", name: "Passività breve", order: 3, accounts: [] },
  { id: "debt_long", name: "Passività lungo", order: 4, accounts: [] },
];

export async function getOrCreateOrganizationPreferences(
  db: DBClient,
  organizationId: string,
): Promise<DB_OrganizationPreferences> {
  const existing = await db
    .select()
    .from(organization_preferences_table)
    .where(eq(organization_preferences_table.organizationId, organizationId))
    .limit(1);

  if (existing.length > 0) return existing[0]!;

  const defaults: DB_OrganizationPreferencesInsert = {
    organizationId,
    baseCurrency: "EUR",
    timezone: "Europe/Rome",
    locale: "it-IT",
    weekStartDay: 1,
    data: { account_groups: DEFAULT_ACCOUNT_GROUPS },
  };

  const inserted = await db
    .insert(organization_preferences_table)
    .values(defaults)
    .returning();

  return inserted[0]!;
}

export async function getPreferences(
  db: DBClient,
  organizationId: string,
): Promise<HybridPreferences> {
  const row = await getOrCreateOrganizationPreferences(db, organizationId);
  return {
    baseCurrency: row.baseCurrency,
    timezone: row.timezone,
    locale: row.locale,
    weekStartDay: row.weekStartDay,
    data: row.data ?? {},
  };
}

export async function updatePreferences(
  db: DBClient,
  organizationId: string,
  update: Partial<HybridPreferences>,
): Promise<HybridPreferences> {
  const current = await getOrCreateOrganizationPreferences(db, organizationId);
  const next = {
    baseCurrency: update.baseCurrency ?? current.baseCurrency,
    timezone: update.timezone ?? current.timezone,
    locale: update.locale ?? current.locale,
    weekStartDay: update.weekStartDay ?? current.weekStartDay,
    data: { ...current.data, ...(update.data ?? {}) },
  } satisfies HybridPreferences;

  const updated = await db
    .update(organization_preferences_table)
    .set({
      baseCurrency: next.baseCurrency,
      timezone: next.timezone,
      locale: next.locale,
      weekStartDay: next.weekStartDay,
      data: next.data,
    })
    .where(eq(organization_preferences_table.organizationId, organizationId))
    .returning();

  const row = updated[0]!;
  return {
    baseCurrency: row.baseCurrency,
    timezone: row.timezone,
    locale: row.locale,
    weekStartDay: row.weekStartDay,
    data: row.data ?? {},
  };
}

export async function listAccountGroups(
  db: DBClient,
  organizationId: string,
): Promise<AccountGroup[]> {
  const prefs = await getPreferences(db, organizationId);
  const groups = prefs.data.account_groups ?? DEFAULT_ACCOUNT_GROUPS;
  // Ensure deterministic order
  return [...groups].sort((a, b) => a.order - b.order);
}

export async function updateAccountGroups(
  db: DBClient,
  organizationId: string,
  groups: AccountGroup[],
): Promise<AccountGroup[]> {
  validateUniqueAccounts(groups);
  const prefs = await getPreferences(db, organizationId);
  const next = { ...prefs.data, account_groups: groups };
  await updatePreferences(db, organizationId, { data: next });
  return listAccountGroups(db, organizationId);
}

export async function assignAccountToGroup(
  db: DBClient,
  organizationId: string,
  accountId: string,
  groupId: string,
): Promise<AccountGroup[]> {
  const groups = await listAccountGroups(db, organizationId);
  const cleaned = groups.map((g) => ({
    ...g,
    accounts: g.accounts.filter((id) => id !== accountId),
  }));

  const target = cleaned.find((g) => g.id === groupId);
  if (!target) throw new Error("Target group not found");
  target.accounts.push(accountId);

  validateUniqueAccounts(cleaned);
  return updateAccountGroups(db, organizationId, cleaned);
}

function validateUniqueAccounts(groups: AccountGroup[]) {
  const seen = new Set<string>();
  for (const g of groups) {
    for (const acc of g.accounts) {
      if (seen.has(acc)) {
        throw new Error("An account cannot belong to multiple groups");
      }
      seen.add(acc);
    }
  }
}
