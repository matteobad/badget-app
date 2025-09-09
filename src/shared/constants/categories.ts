import type { CategoryHierarchy } from "../types/category-types";
import { getCategoryColor } from "../helpers/categories";

// Raw category definitions without colors
const RAW_CATEGORIES = [
  // 0. ROOT
  {
    slug: "root",
    name: "Root",
    children: [
      // 1. INCOME
      {
        slug: "income",
        name: "Entrate",
        children: [
          { slug: "salary", name: "Stipendio" },
          { slug: "bonus", name: "Bonus & Premi" },
          { slug: "freelance", name: "Freelance" },
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
      { slug: "uncategorized", name: "Uncategorized", system: true },
      { slug: "transfer", name: "Transfer", system: true, excluded: true },
    ],
  },
] as const;

// Function to automatically apply colors and parentSlug to all categories, recursively for unlimited nested levels
function applyColorsToCategories(
  rawCategories: readonly any[],
  parentSlug?: string,
): CategoryHierarchy {
  return rawCategories.map((category) => {
    const { children, ...rest } = category;
    const withMeta = {
      ...rest,
      color: getCategoryColor(category.slug),
      system: !!category.system,
      excluded: !!category.excluded,
      ...(parentSlug ? { parentSlug } : {}),
    };

    // Recursively process children if they exist
    if (children && Array.isArray(children)) {
      return {
        ...withMeta,
        children: applyColorsToCategories(children, category.slug),
      };
    }

    // Return category with empty children array if no children
    return {
      ...withMeta,
      children: [],
    };
  });
}

export const CATEGORIES: CategoryHierarchy =
  applyColorsToCategories(RAW_CATEGORIES);
