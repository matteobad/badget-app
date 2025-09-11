import type { DB_TransactionCategoryType } from "~/server/db/schema/transactions";

import { CATEGORY_COLOR_MAP, CATEGORY_COLORS } from "../constants/colors";

export const colors = [
  "#FF6900", // Orange
  "#FCB900", // Yellow
  "#00D084", // Emerald
  "#8ED1FC", // Sky Blue
  "#0693E3", // Blue
  "#ABB8C3", // Gray
  "#EB144C", // Red
  "#F78DA7", // Pink
  "#9900EF", // Purple
  "#0079BF", // Dark Blue
  "#B6BBBF", // Light Gray
  "#FF5A5F", // Coral
  "#F7C59F", // Peach
  "#8492A6", // Slate
  "#4D5055", // Charcoal
  "#AF5A50", // Terracotta
  "#F9D6E7", // Pale Pink
  "#B5EAEA", // Pale Cyan
  "#B388EB", // Lavender
  "#B04632", // Rust
  "#FF78CB", // Pink
  "#4E5A65", // Gray
  "#01FF70", // Lime
  "#85144b", // Pink
  "#F012BE", // Purple
  "#7FDBFF", // Sky Blue
  "#3D9970", // Olive
  "#AAAAAA", // Silver
  "#111111", // Black
  "#0074D9", // Blue
  "#39CCCC", // Teal
  "#001f3f", // Navy
  "#FF9F1C", // Orange
  "#5E6A71", // Ash
  "#75D701", // Neon Green
  "#B6C8A9", // Lichen
  "#00A9FE", // Electric Blue
  "#EAE8E1", // Bone
  "#CD346C", // Raspberry
  "#FF6FA4", // Pink Sherbet
  "#D667FB", // Purple Mountain Majesty
  "#0080FF", // Azure
  "#656D78", // Dim Gray
  "#F8842C", // Tangerine
  "#FF8CFF", // Carnation Pink
  "#647F6A", // Feldgrau
  "#5E574E", // Field Drab
  "#EF5466", // KU Crimson
  "#B0E0E6", // Powder Blue
  "#EB5E7C", // Rose Pink
  "#8A2BE2", // Blue Violet
  "#6B7C85", // Slate Gray
  "#8C92AC", // Lavender Blue
  "#6C587A", // Eminence
  "#52A1FF", // Azureish White
  "#32CD32", // Lime Green
  "#E04F9F", // Orchid Pink
  "#915C83", // Lilac Bush
  "#4C6B88", // Air Force Blue
  "#587376", // Cadet Blue
  "#C46210", // Buff
  "#65B0D0", // Columbia Blue
  "#2F4F4F", // Dark Slate Gray
  "#528B8B", // Dark Cyan
  "#8B4513", // Saddle Brown
  "#4682B4", // Steel Blue
  "#CD853F", // Peru
  "#FFA07A", // Light Salmon
  "#CD5C5C", // Indian Red
  "#483D8B", // Dark Slate Blue
  "#696969", // Dim Gray
];

export function getColor(value: string, arrayLength: number) {
  const hashValue = customHash(value);
  const index = hashValue % arrayLength;
  return index;
}

export function getColorFromName(value: string) {
  const index = getColor(value, colors.length);

  return colors[index]!;
}

export function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex]!;
}

export function getCategoryColors(hex = "#606060") {
  const backgroundColor = `color-mix(in oklab, ${hex} 10%, transparent)`;
  const borderColor = `color-mix(in oklab, ${hex} 10%, transparent)`;
  const color = hex;

  return { backgroundColor, borderColor, color };
}

export type Category = Omit<
  DB_TransactionCategoryType,
  "createdAt" | "updatedAt" | "deletedAt" | "organizationId"
>;

export type CategoryWithChildren = Category & {
  children: string[];
};

export function buildCategoryRecord(categories: Category[]) {
  const record: Record<string, CategoryWithChildren> = {};

  // inizializza tutte le categorie con children vuoti
  for (const c of categories) {
    record[c.id] = { ...c, children: [] };
  }

  // popola i children
  for (const c of categories) {
    if (c.parentId && record[c.parentId]) {
      record[c.parentId]!.children.push(c.id);
    }
  }

  // aggiungi root (tutti quelli senza parentId)
  record.root = {
    id: "root",
    parentId: null,
    name: "Root",
    slug: "root",
    color: null,
    icon: null,
    description: null,
    excludeFromAnalytics: false,
    system: false,
    children: categories.filter((c) => !c.parentId).map((c) => c.id),
  };

  // aggiungi uncategorized (vuoto)
  // record["uncategorized"] = {
  //   id: "uncategorized",
  //   parentId: null,
  //   type: "uncategorized" as any,
  //   name: "Uncategorized",
  //   slug: "uncategorized",
  //   color: null,
  //   icon: null,
  //   description: null,
  //   excludeFromAnalytics: false,
  //   children: [],
  // };

  return record;
}

// Hash function for consistent color generation
export function customHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) + value.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Get color index from a string value
export function getColorIndex(value: string): number {
  const hashValue = customHash(value);
  return hashValue % CATEGORY_COLORS.length;
}

// Get color from a string value (slug)
export function getColorFromSlug(slug: string): string {
  const index = getColorIndex(slug);
  // Ensure index is within bounds and CATEGORY_COLORS[index] is defined
  return CATEGORY_COLORS[index] ?? CATEGORY_COLORS[0];
}

// Get color for a category (uses predefined mapping)
export function getCategoryColor(slug: string): string {
  const color = CATEGORY_COLOR_MAP[slug as keyof typeof CATEGORY_COLOR_MAP];
  if (color) {
    return color;
  }

  // Fallback to hash-based generation for any unmapped categories
  return getColorFromSlug(slug);
}
