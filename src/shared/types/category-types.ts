// Base category type
// TODO: fix model
export interface BaseCategory {
  slug: string;
  name: string;
  color?: string;
  system: boolean;
  excluded?: boolean;
}

// Category with children - supports unlimited nesting levels
export interface CategoryWithChildren extends BaseCategory {
  children: CategoryWithChildren[];
  parentSlug?: string; // Reference to parent category slug (for readability)
}

// Category hierarchy type - now supports unlimited levels
export type CategoryHierarchy = CategoryWithChildren[];
