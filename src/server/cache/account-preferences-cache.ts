import { redis } from "../redis";

// Redis-based cache for chat data shared across all server instances
const accountPreferencesCachePrefix = "account-preferences";
const accountPreferencesCacheTTL = 30 * 24 * 60 * 60; // 30 days TTL

export interface AccountPreferences {
  liquidAccounts: string[]; // Up to 7 widgets in order
  emergencyAccounts: string[]; // Remaining widgets not in primary
  shortTermAccounts: string[]; // Remaining widgets not in primary
  investmentsAccounts: string[]; // Remaining widgets not in primary
  otherAccounts: string[]; // Remaining accounts
}

export const DEFAULT_WIDGET_PREFERENCES: AccountPreferences = {
  liquidAccounts: [],
  emergencyAccounts: [],
  shortTermAccounts: [],
  investmentsAccounts: [],
  otherAccounts: [], // Remaining widget(s)
};

export const accountPreferencesCache = {
  getAccountPreferences: async (organizationId: string, userId: string) => {
    const key = `${accountPreferencesCachePrefix}${organizationId}${userId}`;
    const preferences = await redis.get<AccountPreferences>(key);

    // TODO: implement
    return preferences;
  },

  setAccountPreferences: async (
    organizationId: string,
    userId: string,
    preferences: AccountPreferences,
  ): Promise<void> => {
    // TODO: Validate preferences before saving

    const key = `${accountPreferencesCachePrefix}${organizationId}${userId}`;
    await redis.set(key, preferences, { ex: accountPreferencesCacheTTL });
  },

  updatePrimaryWidgets: async (
    organizationId: string,
    userId: string,
    newPrimaryWidgets: string[],
  ): Promise<AccountPreferences> => {
    if (newPrimaryWidgets.length > 7) {
      throw new Error("Primary widgets cannot exceed 7");
    }

    // TODO: implement

    const newPreferences: AccountPreferences = {
      liquidAccounts: [],
      emergencyAccounts: [],
      shortTermAccounts: [],
      investmentsAccounts: [],
      otherAccounts: [], // Remaining widget(s)
    };

    await accountPreferencesCache.setAccountPreferences(
      organizationId,
      userId,
      newPreferences,
    );

    return newPreferences;
  },
};
