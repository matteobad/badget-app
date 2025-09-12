// Base category type
export interface BaseCategory {
  slug: string;
  name: string;
  color?: string;
  icon?: string;
  system: boolean;
  excluded?: boolean;
}

// Parent category interface
export interface ParentCategory extends BaseCategory {
  children: ChildCategory[];
}

// Child category interface
export interface ChildCategory extends BaseCategory {
  parentSlug: string; // Reference to parent category slug (for readability)
}

// Category hierarchy type - now supports unlimited levels
export type CategoryHierarchy = ParentCategory[];
