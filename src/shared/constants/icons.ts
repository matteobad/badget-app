import {
  ActivityIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  AwardIcon,
  BanknoteArrowUpIcon,
  BellIcon,
  Building2Icon,
  CarIcon,
  CatIcon,
  ChartCandlestickIcon,
  CheckSquareIcon,
  CigaretteIcon,
  CircleDashedIcon,
  CoffeeIcon,
  CreditCardIcon,
  DicesIcon,
  DogIcon,
  FuelIcon,
  Gamepad2Icon,
  HamburgerIcon,
  HandCoinsIcon,
  HeartIcon,
  HomeIcon,
  HousePlugIcon,
  LockIcon,
  MapIcon,
  PiggyBankIcon,
  PlaneIcon,
  RocketIcon,
  ShoppingCartIcon,
  SmartphoneIcon,
  SmileIcon,
  SparklesIcon,
  SproutIcon,
  TagIcon,
  ThumbsUpIcon,
  TvIcon,
  UmbrellaIcon,
  UsersIcon,
  UtensilsIcon,
} from "lucide-react";

// Comprehensive color mapping for all categories
export const CATEGORY_ICON_MAP = {
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

// Define available icons with their lucide-react dashed-case names and Icon suffix
export const DEFAULT_ICONS = [
  { name: "circle-dashed", icon: CircleDashedIcon },
  { name: "coffee", icon: CoffeeIcon },
  { name: "cat", icon: CatIcon },
  { name: "dog", icon: DogIcon },
  { name: "heart", icon: HeartIcon },
  { name: "credit-card", icon: CreditCardIcon },
  { name: "piggy-bank", icon: PiggyBankIcon },
  { name: "bell", icon: BellIcon },
  { name: "sparkles", icon: SparklesIcon },
  { name: "cigarette", icon: CigaretteIcon },
  { name: "smile", icon: SmileIcon },
  { name: "arrow-left", icon: ArrowLeftIcon },
  { name: "activity", icon: ActivityIcon },
  { name: "hand-coins", icon: HandCoinsIcon },
  { name: "tag", icon: TagIcon },
  { name: "banknote-arrow-up", icon: BanknoteArrowUpIcon },
  { name: "rocket", icon: RocketIcon },
  { name: "lock", icon: LockIcon },
  { name: "thumbs-up", icon: ThumbsUpIcon },
  { name: "umbrella", icon: UmbrellaIcon },
  { name: "house-plug", icon: HousePlugIcon },
  { name: "fuel", icon: FuelIcon },
  { name: "check-square", icon: CheckSquareIcon },
  { name: "map", icon: MapIcon },
  { name: "smartphone", icon: SmartphoneIcon },
  { name: "tv", icon: TvIcon },
  { name: "gamepad-2", icon: Gamepad2Icon },
  { name: "sprout", icon: SproutIcon },
  { name: "users", icon: UsersIcon },
  { name: "shopping-cart", icon: ShoppingCartIcon },
  { name: "plane", icon: PlaneIcon },
  { name: "arrow-right", icon: ArrowRightIcon },
  { name: "utensils", icon: UtensilsIcon },
  { name: "building-2", icon: Building2Icon },
  { name: "home", icon: HomeIcon },
  { name: "hamburger", icon: HamburgerIcon },
  { name: "chart-candlestick", icon: ChartCandlestickIcon },
  { name: "dices", icon: DicesIcon },
  { name: "award", icon: AwardIcon },
  { name: "car", icon: CarIcon },
] as const;

export type IconKey = (typeof DEFAULT_ICONS)[number]["name"];
