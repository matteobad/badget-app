import { z } from "zod/v4";

export const accountGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(64),
  order: z.number().int().min(0),
  accounts: z.array(z.uuid()).default([]),
});

export const preferencesDataSchema = z.object({
  account_groups: z.array(accountGroupSchema).default([]).optional(),
});

export const preferencesSchema = z.object({
  baseCurrency: z.string().length(3).default("EUR"),
  timezone: z.string().default("Europe/Rome"),
  locale: z.string().default("it-IT"),
  weekStartDay: z.number().int().min(0).max(6).default(1),
  data: preferencesDataSchema.default({ account_groups: [] }),
});

export const updatePreferencesSchema = preferencesSchema.partial();

export const updateAccountGroupsSchema = z.object({
  groups: z.array(accountGroupSchema),
});

export const assignAccountToGroupSchema = z.object({
  accountId: z.uuid(),
  groupId: z.string().min(1),
});

export type AccountGroupInput = z.infer<typeof accountGroupSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type PreferencesUpdateInput = z.infer<typeof updatePreferencesSchema>;

const userWidgetSchema = z.object({
  id: z.string(),
  settings: z
    .object({
      period: z.string().optional(),
      type: z.string().optional(),
    })
    .optional(),
});

export const updateUserWidgetsSchema = z.object({
  widgets: z.array(userWidgetSchema),
});

export const updateUserWidgetSchema = userWidgetSchema;
