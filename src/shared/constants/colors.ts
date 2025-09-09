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
  // 0. ROOT
  root: "#000000", // Placeholder

  // 1. INCOME
  income: "#00D084", // Green
  salary: "#22c55e",
  bonus: "#4ade80",
  freelance: "#86efac",
  refunds: "#bbf7d0",
  "other-income": "#dcfce7",

  // 2. HOUSING
  housing: "#FF6900", // Orange
  "rent-mortgage": "#3b82f6",
  utilities: "#60a5fa",
  maintenance: "#93c5fd",

  // 3. FOOD & DRINK
  "food-drink": "#0693E3", // Blue
  groceries: "#fbbf24",
  restaurants: "#fcd34d",
  coffee: "#fde68a",

  // 4. TRANSPORTATION
  transport: "#8ED1FC", // Sky Blue
  fuel: "#8b5cf6",
  "public-transport": "#a78bfa",
  "car-maintenance": "#c4b5fd",

  // 5. HEALTH
  health: "#EB144C", // Red
  doctor: "#ef4444",
  pharmacy: "#f87171",
  insurance: "#fca5a5",

  // 6. LEISURE
  leisure: "#39CCCC", // Teal
  entertainment: "#ec4899",
  subscriptions: "#f472b6",
  travel: "#f9a8d4",

  // 7. OTHER
  other: "#6b7280", // grigio neutro
  gifts: "#9ca3af",
  donations: "#d1d5db",
  misc: "#e5e7eb",

  // 8. SYSTEM
  system: "#475569",
  uncategorized: "#475569",
  transfer: "#334155",
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
