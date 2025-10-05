export const ACTIVITY_TYPE = {
  TRANSACTIONS_CREATED: "transactions_created",
  TRANSACTIONS_ENRICHED: "transactions_enriched",
  TRANSACTIONS_EXPORTED: "transactions_exported",
} as const;
export type ActivityType = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];
