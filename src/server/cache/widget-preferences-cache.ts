import { redis } from "../redis";

// Redis-based cache for chat data shared across all server instances
const widgetPreferencesCachePrefix = "widget-preferences";
const widgetPreferencesCacheTTL = 30 * 24 * 60 * 60; // 30 days TTL

export type WidgetType =
  | "cash-flow"
  | "net-worth"
  | "monthly-income"
  | "monthly-spending"
  | "category-expenses"
  | "recurring-tracker"
  | "uncategorized-transactions"
  | "savings"
  | "account-balances";

export interface WidgetPreferences {
  primaryWidgets: WidgetType[]; // Up to 7 widgets in order
  availableWidgets: WidgetType[]; // Remaining widgets not in primary
}

export const DEFAULT_WIDGET_ORDER: WidgetType[] = [
  "cash-flow",
  "net-worth",
  "monthly-income",
  "monthly-spending",
  "category-expenses",
  "recurring-tracker",
  "uncategorized-transactions",
  "savings",
  "account-balances",
];

export const DEFAULT_WIDGET_PREFERENCES: WidgetPreferences = {
  primaryWidgets: DEFAULT_WIDGET_ORDER.slice(0, 7), // First 7 widgets
  availableWidgets: DEFAULT_WIDGET_ORDER.slice(7), // Remaining widget(s)
};

export const widgetPreferencesCache = {
  getWidgetPreferences: async (
    organizationId: string,
    userId: string,
  ): Promise<WidgetPreferences> => {
    const key = `${widgetPreferencesCachePrefix}${organizationId}${userId}`;
    const preferences = await redis.get<WidgetPreferences>(key);

    if (!preferences) {
      // Return default preferences if none exist
      return DEFAULT_WIDGET_PREFERENCES;
    }

    // Validate the preferences and ensure all widgets are accounted for
    const allWidgets = [
      ...preferences.primaryWidgets,
      ...preferences.availableWidgets,
    ];
    const missingWidgets = DEFAULT_WIDGET_ORDER.filter(
      (widget) => !allWidgets.includes(widget),
    );
    const extraWidgets = allWidgets.filter(
      (widget) => !DEFAULT_WIDGET_ORDER.includes(widget),
    );

    // If there are missing or extra widgets, return default preferences
    if (missingWidgets.length > 0 || extraWidgets.length > 0) {
      console.warn(
        `Invalid widget preferences for space ${organizationId}, user ${userId}. Returning defaults.`,
      );
      return DEFAULT_WIDGET_PREFERENCES;
    }

    return preferences;
  },

  setWidgetPreferences: async (
    organizationId: string,
    userId: string,
    preferences: WidgetPreferences,
  ): Promise<void> => {
    // Validate preferences before saving
    const allWidgets = [
      ...preferences.primaryWidgets,
      ...preferences.availableWidgets,
    ];

    // Check that we have exactly the right widgets
    if (allWidgets.length !== DEFAULT_WIDGET_ORDER.length) {
      throw new Error(
        "Invalid widget preferences: incorrect number of widgets",
      );
    }

    // Check that all default widgets are present and no extras
    const missingWidgets = DEFAULT_WIDGET_ORDER.filter(
      (widget) => !allWidgets.includes(widget),
    );
    const extraWidgets = allWidgets.filter(
      (widget) => !DEFAULT_WIDGET_ORDER.includes(widget),
    );

    if (missingWidgets.length > 0) {
      throw new Error(
        `Invalid widget preferences: missing widgets ${missingWidgets.join(", ")}`,
      );
    }

    if (extraWidgets.length > 0) {
      throw new Error(
        `Invalid widget preferences: unknown widgets ${extraWidgets.join(", ")}`,
      );
    }

    // Check that primary widgets doesn't exceed 7
    if (preferences.primaryWidgets.length > 7) {
      throw new Error(
        "Invalid widget preferences: primary widgets cannot exceed 7",
      );
    }

    // Check for duplicates
    const duplicates = allWidgets.filter(
      (widget, index) => allWidgets.indexOf(widget) !== index,
    );
    if (duplicates.length > 0) {
      throw new Error(
        `Invalid widget preferences: duplicate widgets ${duplicates.join(", ")}`,
      );
    }

    const key = `${widgetPreferencesCachePrefix}${organizationId}${userId}`;
    await redis.set(key, preferences, { ex: widgetPreferencesCacheTTL });
  },

  updatePrimaryWidgets: async (
    organizationId: string,
    userId: string,
    newPrimaryWidgets: WidgetType[],
  ): Promise<WidgetPreferences> => {
    if (newPrimaryWidgets.length > 7) {
      throw new Error("Primary widgets cannot exceed 7");
    }

    // Calculate available widgets (all widgets not in primary)
    const availableWidgets = DEFAULT_WIDGET_ORDER.filter(
      (widget) => !newPrimaryWidgets.includes(widget),
    );

    const newPreferences: WidgetPreferences = {
      primaryWidgets: newPrimaryWidgets,
      availableWidgets,
    };

    await widgetPreferencesCache.setWidgetPreferences(
      organizationId,
      userId,
      newPreferences,
    );
    return newPreferences;
  },
};
