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

// Define available colors with their Tailwind classes and hex values
export const DEFAULT_COLORS = [
  { name: "neutral-600", value: "#525252" },
  { name: "red-600", value: "#dc2626" },
  { name: "orange-600", value: "#ea580c" },
  { name: "amber-600", value: "#d97706" },
  { name: "yellow-600", value: "#ca8a04" },
  { name: "lime-600", value: "#65a30d" },
  { name: "green-600", value: "#16a34a" },
  { name: "emerald-600", value: "#059669" },
  { name: "teal-600", value: "#0d9488" },
  { name: "cyan-600", value: "#0891b2" },
  { name: "sky-600", value: "#0284c7" },
  { name: "blue-600", value: "#2563eb" },
  { name: "indigo-600", value: "#4f46e5" },
  { name: "fuchsia-600", value: "#c026d3" },
  { name: "pink-600", value: "#db2777" },
] as const;

export type ColorKey = keyof typeof DEFAULT_COLORS;
