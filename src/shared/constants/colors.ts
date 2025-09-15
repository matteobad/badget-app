// Comprehensive color palette for financial categories
export const CATEGORY_COLORS = [
  // Primary Business Colors
  "#FF6900", // Orange - Revenue
  "#00D084", // Emerald - Cost of Goods Sold
  "#0693E3", // Blue - Sales & Marketing
  "#8ED1FC", // Sky Blue - Operations
  "#9900EF", // Purple - Professional Services
  "#EB144C", // Red - Human Resources
  "#FF9F1C", // Orange - Travel & Entertainment
  "#39CCCC", // Teal - Technology
  "#0074D9", // Blue - Banking & Finance
  "#3D9970", // Olive - Assets & CapEx
  "#B04632", // Rust - Liabilities & Debt
  "#DC2626", // Red - Taxes & Government
  "#059669", // Green - Owner / Equity
  "#6B7280", // Gray - System

  // Extended Palette for Child Categories
  "#FCB900", // Yellow
  "#ABB8C3", // Gray
  "#F78DA7", // Pink
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
  "#FF78CB", // Pink
  "#4E5A65", // Gray
  "#01FF70", // Lime
  "#85144B", // Pink
  "#F012BE", // Purple
  "#7FDBFF", // Sky Blue
  "#AAAAAA", // Silver
  "#111111", // Black
  "#001F3F", // Navy
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
] as const;

// Comprehensive color mapping for all categories
export const CATEGORY_COLOR_MAP = {
  // 1. INCOME
  income: "#14532d", // green-900
  salary: "#166534", // green-800
  bonus: "#15803d", // green-700
  freelance: "#16a34a", // green-600
  "other-income": "#22c55e", // green-500

  // 2. HOUSING
  housing: "#7c2d12", // orange-900
  "rent-mortgage": "#9a3412", // orange-800
  utilities: "#c2410c", // orange-700
  maintenance: "#ea580c", // orange-600

  // 3. FOOD & DRINK
  "food-drink": "#78350f", // amber-900
  groceries: "#92400e", // amber-800
  restaurants: "#b45309", // amber-700
  coffee: "#d97706", // amber-600

  // 4. TRANSPORTATION
  transport: "#0c4a6e", // sky-900
  fuel: "#075985", // sky-800
  "public-transport": "#0369a1", // sky-700
  "car-maintenance": "#0284c7", // sky-600

  // 5. HEALTH
  health: "#7f1d1d", // red-900
  doctor: "#991b1b", // red-800
  pharmacy: "#b91c1c", // red-700
  insurance: "#dc2626", // red-600

  // 6. LEISURE
  leisure: "#134e4a", // teal-900
  entertainment: "#115e59", // teal-800
  subscriptions: "#0f766e", // teal-700
  travel: "#0d9488", // teal-600

  // 7. OTHER
  other: "#111827", // gray-900
  gifts: "#1f2937", // gray-800
  donations: "#374151", // gray-700
  misc: "#4b5563", // gray-600

  // 8. SYSTEM
  uncategorized: "#404040", // neutral-700
  transfer: "#44403c", // stone-700
  adjustment: "#3f3f46", // zinc-700
} as const;

// Define available colors with their Tailwind classes and hex values
export const DEFAULT_COLORS = [
  { name: "Gray", value: "#6B7280" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Green", value: "#10B981" },
  { name: "Orange", value: "#F59E0B" },
  { name: "Red", value: "#EF4444" },
  { name: "Pink", value: "#EC4899" },
  { name: "Purple", value: "#8B5CF6" },
] as const;

export type ColorKey = keyof typeof DEFAULT_COLORS;
