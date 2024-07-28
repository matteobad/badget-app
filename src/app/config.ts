import type { LucideIcon } from "lucide-react";
import {
  BuildingIcon,
  CandlestickChartIcon,
  LayersIcon,
  PiggyBankIcon,
  TrendingDown,
} from "lucide-react";

type SidebarItem = {
  title: string;
  icon: LucideIcon;
  link: string;
  label?: string;
};

export const sidebarItems = [
  { title: "Banking", icon: LayersIcon, link: "/banking", label: "" },
  { title: "Savings", icon: PiggyBankIcon, link: "/savings", label: "" },
  {
    title: "Investments",
    icon: CandlestickChartIcon,
    link: "/investments",
    label: "",
  },
  { title: "Assets", icon: BuildingIcon, link: "/assets", label: "" },
  { title: "Liabilities", icon: TrendingDown, link: "/liabilities", label: "" },
] satisfies SidebarItem[];
