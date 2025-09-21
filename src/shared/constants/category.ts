import type { LucideIcon } from "lucide-react";
import {
  AlarmClockIcon,
  BabyIcon,
  BanknoteIcon,
  BikeIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BuildingIcon,
  BusIcon,
  CalendarIcon,
  CarIcon,
  ClipboardListIcon,
  CoinsIcon,
  DogIcon,
  DumbbellIcon,
  FilmIcon,
  FolderIcon,
  Gamepad2Icon,
  GiftIcon,
  GlobeIcon,
  GraduationCapIcon,
  HammerIcon,
  HeartIcon,
  HomeIcon,
  LaptopIcon,
  LeafIcon,
  LightbulbIcon,
  LineChartIcon,
  MapPinIcon,
  MedalIcon,
  MoonIcon,
  MoreHorizontalIcon,
  MusicIcon,
  PiggyBankIcon,
  PillIcon,
  PlaneIcon,
  RouterIcon,
  SchoolIcon,
  ShieldCheckIcon,
  ShirtIcon,
  ShoppingCartIcon,
  SparklesIcon,
  SproutIcon,
  StarIcon,
  SunIcon,
  TagIcon,
  TicketIcon,
  TruckIcon,
  UsersIcon,
  UtensilsIcon,
  WalletIcon,
  WrenchIcon,
} from "lucide-react";

// Icon set filtrabile
export const CATEGORY_ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: "alarm-clock", Icon: AlarmClockIcon },
  { name: "baby", Icon: BabyIcon },
  { name: "banknote", Icon: BanknoteIcon },
  { name: "bike", Icon: BikeIcon },
  { name: "book-open", Icon: BookOpenIcon },
  { name: "briefcase", Icon: BriefcaseIcon },
  { name: "building", Icon: BuildingIcon },
  { name: "bus", Icon: BusIcon },
  { name: "calendar", Icon: CalendarIcon },
  { name: "car", Icon: CarIcon },
  { name: "clipboard-list", Icon: ClipboardListIcon },
  { name: "coins", Icon: CoinsIcon },
  { name: "dog", Icon: DogIcon },
  { name: "dumbbell", Icon: DumbbellIcon },
  { name: "film", Icon: FilmIcon },
  { name: "folder", Icon: FolderIcon },
  { name: "gamepad-2", Icon: Gamepad2Icon },
  { name: "gift", Icon: GiftIcon },
  { name: "globe", Icon: GlobeIcon },
  { name: "graduation-cap", Icon: GraduationCapIcon },
  { name: "hammer", Icon: HammerIcon },
  { name: "heart", Icon: HeartIcon },
  { name: "home", Icon: HomeIcon },
  { name: "laptop", Icon: LaptopIcon },
  { name: "leaf", Icon: LeafIcon },
  { name: "lightbulb", Icon: LightbulbIcon },
  { name: "line-chart", Icon: LineChartIcon },
  { name: "map-pin", Icon: MapPinIcon },
  { name: "medal", Icon: MedalIcon },
  { name: "moon", Icon: MoonIcon },
  { name: "more-horizontal", Icon: MoreHorizontalIcon },
  { name: "music", Icon: MusicIcon },
  { name: "piggy-bank", Icon: PiggyBankIcon },
  { name: "pill", Icon: PillIcon },
  { name: "plane", Icon: PlaneIcon },
  { name: "router", Icon: RouterIcon },
  { name: "school", Icon: SchoolIcon },
  { name: "shield-check", Icon: ShieldCheckIcon },
  { name: "shirt", Icon: ShirtIcon },
  { name: "shopping-cart", Icon: ShoppingCartIcon },
  { name: "sparkles", Icon: SparklesIcon },
  { name: "sprout", Icon: SproutIcon },
  { name: "star", Icon: StarIcon },
  { name: "sun", Icon: SunIcon },
  { name: "tag", Icon: TagIcon },
  { name: "ticket", Icon: TicketIcon },
  { name: "truck", Icon: TruckIcon },
  { name: "users", Icon: UsersIcon },
  { name: "utensils", Icon: UtensilsIcon },
  { name: "wallet", Icon: WalletIcon },
  { name: "wrench", Icon: WrenchIcon },
];

// Base color palette for financial categories
export const BASE_COLORS = [
  // Primary category colors
  "#84cc16", // lime-500
  "#10b981", // emerald-500 - income (verde positivo, crescita)
  "#06b6d4", // cyan-500 - family - (fresco, cura e crescita)
  "#0ea5e9", // sky-500 - housing - (blu stabile, affidabile)
  "#f59e0b", // amber-500 - transport - (giallo/ocra, richiama carburante/viaggi)
  "#f97316", // orange-500 - food - (caldo e immediato, cibo)
  "#ef4444", // red-500
  "#f43f5e", // rose-500 - health - (colore umano, legato al corpo)
  "#8b5cf6", // violet-500 - leisure - (creatività e svago)
  "#64748b", // slate-500 - other - (neutro, general)
  "#737373", // neutral-500 - default - (neutro, fallback)

  // Extra colors
] as const;

export type BaseColor = (typeof BASE_COLORS)[number];

// Comprehensive color mapping for all categories
export const CATEGORY_COLOR_MAP = {
  // 1. INCOME
  income: "#10b981", // emerald-500
  salary: "#34d399", // emerald-400
  bonus: "#6ee7b7", // emerald-300
  freelance: "#a7f3d0", // emerald-200
  "other-income": "#d1fae5", // emerald-100

  // 2. HOUSING
  housing: "#0ea5e9", // sky-500
  "rent-mortgage": "#38bdf8", // sky-400
  utilities: "#7dd3fc", // sky-300
  maintenance: "#bae6fd", // sky-200
  insurance: "#e0f2fe", // sky-100

  // 3. TRANSPORTATION
  transport: "#f59e0b", // amber-500
  fuel: "#fbbf24", // amber-400
  "car-maintenance": "#fcd34d", // amber-300
  "public-transport": "#fde68a", // amber-200
  "car-insurance": "#fef3c7", // amber-100

  // 4. FOOD & DRINK
  "food-drink": "#f97316", // orange-500
  groceries: "#fb923c", // orange-400
  restaurants: "#fdba74", // orange-300
  bar: "#fed7aa", // orange-200
  delivery: "#ffedd5", // orange-100

  // 5. HEALTH
  health: "#f43f5e", // rose-500
  pharmacy: "#fb7185", // rose-400
  doctor: "#fda4af", // rose-300
  sport: "#fecdd3", // rose-200
  "personal-care": "#ffe4e6", // rose-100

  // 6. LEISURE
  leisure: "#8b5cf6", // violet-500
  subscriptions: "#a78bfa", // violet-400
  travel: "#c4b5fd", // violet-300
  events: "#ddd6fe", // violet-200
  hobby: "#ede9fe", // violet-100

  // 6. FAMILY
  family: "#0ea5e9", // cyan-500
  school: "#22d3ee", // cyan-400
  courses: "#67e8f9", // cyan-300
  children: "#a5f3fc", // cyan-200
  gifts: "#cffafe", // cyan-100

  // 7. OTHER
  other: "#64748b", // slate-500
  donations: "#94a3b8", // slate-400
  unexpected: "#cbd5e1", // slate-300
  misc: "#e2e8f0", // slate-200
  transfer: "#f1f5f9", // slate-100

  // 8. SYSTEM
  uncategorized: "#737373", // neutral-500
} as const;

export type CategorySuggestion = {
  keywords: string[];
  icon: LucideIcon;
  color: BaseColor;
};

export const CATEGORY_SUGGESTIONS: CategorySuggestion[] = [
  // Income
  {
    keywords: ["work", "stipendio", "salary", "bonus", "reddito"],
    icon: BriefcaseIcon,
    color: "#10b981",
  },
  {
    keywords: ["income", "entrate", "guadagno", "freelance"],
    icon: WalletIcon,
    color: "#10b981",
  },
  {
    keywords: ["investimenti", "dividendi", "interessi"],
    icon: BanknoteIcon,
    color: "#10b981",
  },

  // Housing
  {
    keywords: ["home", "house", "affitto", "mutuo", "abitazione", "casa"],
    icon: HomeIcon,
    color: "#0ea5e9",
  },
  {
    keywords: ["utilities", "bills", "utenze", "luce", "gas", "acqua"],
    icon: LightbulbIcon,
    color: "#0ea5e9",
  },
  {
    keywords: ["internet", "telefono", "router"],
    icon: RouterIcon,
    color: "#0ea5e9",
  },
  {
    keywords: ["insurance", "assicurazione", "protezione"],
    icon: ShieldCheckIcon,
    color: "#0ea5e9",
  },

  // Trasport
  {
    keywords: ["transport", "car", "auto", "viaggio", "mezzi", "taxi", "fuel"],
    icon: CarIcon,
    color: "#f59e0b",
  },
  {
    keywords: ["bus", "public transport", "mezzi pubblici"],
    icon: BusIcon,
    color: "#f59e0b",
  },
  {
    keywords: ["bicycle", "bike", "ciclismo"],
    icon: BikeIcon,
    color: "#f59e0b",
  },

  // Food
  {
    keywords: [
      "food",
      "groceries",
      "cibo",
      "spesa",
      "ristorante",
      "bar",
      "coffee",
    ],
    icon: UtensilsIcon,
    color: "#f97316",
  },
  {
    keywords: ["shopping", "abbigliamento", "store", "compere", "supermercato"],
    icon: ShoppingCartIcon,
    color: "#f97316",
  },

  // Health
  {
    keywords: ["health", "medico", "salute", "sport", "fitness"],
    icon: HeartIcon,
    color: "#f43f5e",
  },
  {
    keywords: ["medicine", "farmacia", "pill"],
    icon: PillIcon,
    color: "#f43f5e",
  },
  {
    keywords: ["gym", "workout", "palestra"],
    icon: DumbbellIcon,
    color: "#f43f5e",
  },

  // Leisure
  {
    keywords: ["leisure", "tempo libero", "musica"],
    icon: MusicIcon,
    color: "#8b5cf6",
  },
  {
    keywords: ["cinema", "film", "movie", "tv"],
    icon: FilmIcon,
    color: "#8b5cf6",
  },
  {
    keywords: ["gaming", "videogiochi"],
    icon: Gamepad2Icon,
    color: "#8b5cf6",
  },
  {
    keywords: ["viaggi", "travel", "holidays", "vacanze"],
    icon: PlaneIcon,
    color: "#8b5cf6",
  },
  {
    keywords: ["events", "concerti", "ticket"],
    icon: TicketIcon,
    color: "#8b5cf6",
  },

  // Family
  {
    keywords: ["school", "scuola", "istruzione", "università"],
    icon: SchoolIcon,
    color: "#0ea5e9",
  },
  {
    keywords: ["education", "formazione", "corsi", "graduation"],
    icon: GraduationCapIcon,
    color: "#0ea5e9",
  },
  {
    keywords: ["family", "famiglia", "figli", "genitori"],
    icon: UsersIcon,
    color: "#0ea5e9",
  },
  {
    keywords: ["gift", "regalo", "donazione"],
    icon: GiftIcon,
    color: "#0ea5e9",
  },
  {
    keywords: ["baby", "neonato", "bambini"],
    icon: BabyIcon,
    color: "#0ea5e9",
  },

  // Other
  {
    keywords: ["varie", "altro", "misc"],
    icon: MoreHorizontalIcon,
    color: "#64748b",
  },
  {
    keywords: ["folder", "documenti"],
    icon: FolderIcon,
    color: "#64748b",
  },
  {
    keywords: ["tag", "etichette", "spese varie"],
    icon: TagIcon,
    color: "#64748b",
  },

  // Extra generiche
  {
    keywords: ["calendar", "scadenze", "eventi"],
    icon: CalendarIcon,
    color: "#737373",
  },
  { keywords: ["alarm", "reminder"], icon: AlarmClockIcon, color: "#737373" },
  {
    keywords: ["map", "viaggi", "posizione"],
    icon: MapPinIcon,
    color: "#737373",
  },
  {
    keywords: ["laptop", "tech", "computer"],
    icon: LaptopIcon,
    color: "#737373",
  },
  { keywords: ["shirt", "abbigliamento"], icon: ShirtIcon, color: "#737373" },
  { keywords: ["hammer", "manutenzione"], icon: HammerIcon, color: "#737373" },
  {
    keywords: ["book", "studio", "lettura"],
    icon: BookOpenIcon,
    color: "#737373",
  },
  { keywords: ["star", "preferiti"], icon: StarIcon, color: "#737373" },
  { keywords: ["sparkles", "extra"], icon: SparklesIcon, color: "#737373" },
  { keywords: ["building", "uffici"], icon: BuildingIcon, color: "#737373" },
  {
    keywords: ["clipboard", "liste", "to-do"],
    icon: ClipboardListIcon,
    color: "#737373",
  },
  { keywords: ["medal", "premi"], icon: MedalIcon, color: "#737373" },
  { keywords: ["sun", "energia"], icon: SunIcon, color: "#737373" },
  { keywords: ["moon", "notturno"], icon: MoonIcon, color: "#737373" },
  { keywords: ["leaf", "eco", "green"], icon: LeafIcon, color: "#737373" },
  { keywords: ["truck", "consegne"], icon: TruckIcon, color: "#737373" },
  { keywords: ["wrench", "riparazioni"], icon: WrenchIcon, color: "#737373" },
  { keywords: ["dog", "animali"], icon: DogIcon, color: "#737373" },
  {
    keywords: ["globe", "mondo", "internet"],
    icon: GlobeIcon,
    color: "#737373",
  },
];
