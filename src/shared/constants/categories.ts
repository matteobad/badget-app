import type { CategoryHierarchy } from "../types/category-types";
import { getCategoryColor } from "../helpers/categories";

// Raw category definitions without colors
const RAW_CATEGORIES = [
  // 1. INCOME
  {
    slug: "income",
    name: "Entrate",
    children: [
      { slug: "salary", name: "Stipendio" },
      { slug: "bonus", name: "Bonus & Premi" },
      { slug: "freelance", name: "Freelance" },
      { slug: "refunds", name: "Rimborsi" },
      { slug: "other-income", name: "Altre Entrate" },
    ],
  },

  // 2. HOUSING
  {
    slug: "housing",
    name: "Casa",
    children: [
      { slug: "rent-mortgage", name: "Affitto / Mutuo" },
      { slug: "utilities", name: "Utenze" },
      { slug: "maintenance", name: "Manutenzione" },
    ],
  },

  // 3. FOOD & DRINK
  {
    slug: "food-drink",
    name: "Cibo e Bevande",
    children: [
      { slug: "groceries", name: "Spesa" },
      { slug: "restaurants", name: "Ristoranti & Bar" },
      { slug: "coffee", name: "Caffè & Snack" },
    ],
  },

  // 4. TRANSPORTATION
  {
    slug: "transport",
    name: "Trasporti",
    children: [
      { slug: "fuel", name: "Carburante" },
      { slug: "public-transport", name: "Trasporto Pubblico" },
      { slug: "car-maintenance", name: "Manutenzione Auto" },
    ],
  },

  // 5. HEALTH
  {
    slug: "health",
    name: "Salute",
    children: [
      { slug: "doctor", name: "Visite Mediche" },
      { slug: "pharmacy", name: "Farmacia" },
      { slug: "insurance", name: "Assicurazione Sanitaria" },
    ],
  },

  // 6. LEISURE
  {
    slug: "leisure",
    name: "Tempo Libero",
    children: [
      { slug: "entertainment", name: "Intrattenimento" },
      { slug: "subscriptions", name: "Abbonamenti" },
      { slug: "travel", name: "Viaggi" },
    ],
  },

  // 7. OTHER
  {
    slug: "other",
    name: "Varie",
    children: [
      { slug: "gifts", name: "Regali" },
      { slug: "donations", name: "Donazioni" },
      { slug: "misc", name: "Altro" },
    ],
  },

  // 8. SYSTEM
  {
    slug: "system",
    name: "Sistema",
    children: [
      { slug: "uncategorized", name: "Uncategorized" },
      { slug: "transfer", name: "Transfer" },
    ],
  },
] as const;

// Predefined colors for parent categories (for consistency)
export const PARENT_CATEGORY_COLORS = {
  income: "#00D084", // Green
  expense: "#EB144C", // Red
  "saving-investment": "#9900EF", // Purple
  system: "#6B7280", // Gray
} as const;

// Comprehensive color mapping for all categories
export const CATEGORY_COLOR_MAP = {
  // Parent
  income: "#00D084",
  expenses: "#FF6900",
  transfers: "#0074D9",
  system: "#6B7280",

  // 1. INCOME
  salary: "#22c55e",
  bonus: "#4ade80",
  freelance: "#86efac",
  refunds: "#bbf7d0",
  "other-income": "#dcfce7",

  // 2. HOUSING
  housing: "#2563eb", // blu
  "rent-mortgage": "#3b82f6",
  utilities: "#60a5fa",
  maintenance: "#93c5fd",

  // 3. FOOD & DRINK
  "food-drink": "#f59e0b", // arancione
  groceries: "#fbbf24",
  restaurants: "#fcd34d",
  coffee: "#fde68a",

  // 4. TRANSPORTATION
  transport: "#7c3aed", // viola
  fuel: "#8b5cf6",
  "public-transport": "#a78bfa",
  "car-maintenance": "#c4b5fd",

  // 5. HEALTH
  health: "#dc2626", // rosso
  doctor: "#ef4444",
  pharmacy: "#f87171",
  insurance: "#fca5a5",

  // 6. LEISURE
  leisure: "#db2777", // rosa
  entertainment: "#ec4899",
  subscriptions: "#f472b6",
  travel: "#f9a8d4",

  // 7. OTHER
  other: "#6b7280", // grigio neutro
  gifts: "#9ca3af",
  donations: "#d1d5db",
  misc: "#e5e7eb",

  // 8. SYSTEM
  uncategorized: "#475569",
  transfer: "#334155",
} as const;

// Function to automatically apply colors and parentSlug to all categories
function applyColorsToCategories(
  rawCategories: typeof RAW_CATEGORIES,
): CategoryHierarchy {
  return rawCategories.map((parent) => ({
    ...parent,
    color: getCategoryColor(parent.slug),
    system: true,
    excluded: false, // Default to not excluded
    children: parent.children.map((child) => ({
      ...child,
      parentSlug: parent.slug, // Automatically add parentSlug
      color: getCategoryColor(child.slug),
      system: true,
      excluded: false, // Default to not excluded
    })),
  }));
}

export const CATEGORIES: CategoryHierarchy =
  applyColorsToCategories(RAW_CATEGORIES);
