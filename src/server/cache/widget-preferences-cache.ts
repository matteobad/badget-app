import { redis } from "./redis";

// Redis-based cache for chat data shared across all server instances
const widgetPreferencesCachePrefix = "widget-preferences";
const widgetPreferencesCacheTTL = 30 * 24 * 60 * 60; // 30 days TTL

export const WIDGET = {
  // Critical financial health (default primary widgets)
  ACCOUNT_BALANCES: "account-balances",
  CASH_FLOW: "cash-flow",
  NET_WORTH: "net-worth",
  SAVING_ANALYSIS: "saving-analysis",
  INCOME_FORECAST: "income-forecast",
  // REVENUE_SUMMARY: "revenue-summary",
  // GROWTH_RATE: "growth-rate",

  // Expenses & spending
  CATEGORY_EXPENSES: "category-expenses",
  MONTHLY_INCOME: "monthly-income",
  MONTHLY_SPENDING: "monthly-spending",
  REDCURRING_EXPENSES: "recurring-expenses",

  // Misc
  UNCATEGORIZED_TRANSACTIONS: "uncategorized-transactions",
  RECENT_DOCUMENTS: "recent-documents",
} as const;
export type WidgetType = (typeof WIDGET)[keyof typeof WIDGET];

export type WidgetPeriod =
  | "fiscal_ytd"
  | "fiscal_year"
  | "current_quarter"
  | "trailing_12"
  | "current_month";

export type RevenueType = "net" | "gross";

export interface WidgetConfig {
  period?: WidgetPeriod;
  revenueType?: RevenueType;
}

export interface WidgetPreferences {
  primaryWidgets: WidgetType[]; // Up to 7 widgets in order
  availableWidgets: WidgetType[]; // Remaining widgets not in primary
  widgetConfigs?: Record<string, WidgetConfig>; // key is widgetType
}

export const DEFAULT_WIDGET_ORDER: WidgetType[] = [
  "account-balances",
  "cash-flow",
  "net-worth",
  "saving-analysis",
  "category-expenses",
  "monthly-income",
  "monthly-spending",
  "recurring-expenses",
  "uncategorized-transactions",
  "recent-documents",
  "income-forecast",
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

    // Handle migrations when widgets are added or removed
    if (missingWidgets.length > 0 || extraWidgets.length > 0) {
      console.info(
        `Migrating widget preferences for organization ${organizationId}, user ${userId}. Missing: ${missingWidgets.join(", ") || "none"}, Extra: ${extraWidgets.join(", ") || "none"}`,
      );

      // Remove deprecated widgets from both lists
      const migratedPrimaryWidgets = preferences.primaryWidgets.filter(
        (widget) => !extraWidgets.includes(widget),
      );

      const migratedAvailableWidgets = preferences.availableWidgets.filter(
        (widget) => !extraWidgets.includes(widget),
      );

      // Add new widgets to available widgets (they can be moved to primary by the user)
      const updatedAvailableWidgets = [
        ...migratedAvailableWidgets,
        ...missingWidgets,
      ];

      const migratedPreferences: WidgetPreferences = {
        primaryWidgets: migratedPrimaryWidgets,
        availableWidgets: updatedAvailableWidgets,
      };

      // Save the migrated preferences
      await widgetPreferencesCache.setWidgetPreferences(
        organizationId,
        userId,
        migratedPreferences,
      );

      return migratedPreferences;
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

    const currentPreferences =
      await widgetPreferencesCache.getWidgetPreferences(organizationId, userId);

    // Calculate available widgets (all widgets not in primary)
    const availableWidgets = DEFAULT_WIDGET_ORDER.filter(
      (widget) => !newPrimaryWidgets.includes(widget),
    );

    const newPreferences: WidgetPreferences = {
      primaryWidgets: newPrimaryWidgets,
      availableWidgets,
      widgetConfigs: currentPreferences.widgetConfigs,
    };

    await widgetPreferencesCache.setWidgetPreferences(
      organizationId,
      userId,
      newPreferences,
    );
    return newPreferences;
  },

  updateWidgetConfig: async (
    organizationId: string,
    userId: string,
    widgetType: WidgetType,
    config: WidgetConfig,
  ): Promise<WidgetPreferences> => {
    const currentPreferences =
      await widgetPreferencesCache.getWidgetPreferences(organizationId, userId);

    const newPreferences: WidgetPreferences = {
      ...currentPreferences,
      widgetConfigs: {
        ...(currentPreferences.widgetConfigs || {}),
        [widgetType]: config,
      },
    };

    await widgetPreferencesCache.setWidgetPreferences(
      organizationId,
      userId,
      newPreferences,
    );
    return newPreferences;
  },
};
