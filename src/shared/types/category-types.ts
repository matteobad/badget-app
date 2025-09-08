// Base category type
// TODO: fix model
export interface BaseCategory {
  slug: string;
  name: string;
  color?: string;
  system: boolean;
  taxReportingCode?: string;
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

// Category hierarchy type
export type CategoryHierarchy = ParentCategory[];
