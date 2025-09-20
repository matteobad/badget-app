import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Car,
  Heart,
  Home,
  ShoppingCart,
  Utensils,
} from "lucide-react";

// --- Icon set filtrabile ---
export const CATEGORY_ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: "utensils", Icon: Utensils },
  { name: "shopping-cart", Icon: ShoppingCart },
  { name: "car", Icon: Car },
  { name: "home", Icon: Home },
  { name: "briefcase", Icon: Briefcase },
  { name: "heart", Icon: Heart },
  // aggiungi subset ragionato, non tutto Lucide
];

// --- Tailwind base colors ---
export const BASE_COLORS = [
  "slate",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "violet",
] as const;

export type BaseColor = (typeof BASE_COLORS)[number];

export const CATEGORY_COLORS: Record<BaseColor, string[]> = {
  slate: ["#a3a3a3", "#737373", "#525252", "#404040", "#262626"],
  red: ["#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b"],
  orange: ["#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412"],
  yellow: ["#facc15", "#eab308", "#ca8a04", "#a16207", "#854d0e"],
  green: ["#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534"],
  blue: ["#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af"],
  violet: ["#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6"],
};

// --- Palette shades per sottocategorie ---
export const SHADES = [0, 1, 2, 3, 4] as const;

export function buildColor(base: BaseColor, shade: number) {
  return CATEGORY_COLORS[base][shade]!;
}

export interface CategorySuggestion {
  keywords: string[];
  icon: LucideIcon;
  color: BaseColor;
}

export const CATEGORY_SUGGESTIONS: CategorySuggestion[] = [
  {
    keywords: ["food", "groceries", "cibo", "ristorante"],
    icon: Utensils,
    color: "orange",
  },
  {
    keywords: ["shopping", "abbigliamento", "store", "compere"],
    icon: ShoppingCart,
    color: "yellow",
  },
  {
    keywords: ["transport", "car", "auto", "viaggio", "mezzi"],
    icon: Car,
    color: "blue",
  },
  {
    keywords: ["home", "house", "affitto", "mutuo"],
    icon: Home,
    color: "slate",
  },
  {
    keywords: ["work", "stipendio", "salary", "bonus"],
    icon: Briefcase,
    color: "green",
  },
  {
    keywords: ["health", "medico", "salute", "sport"],
    icon: Heart,
    color: "red",
  },
];
