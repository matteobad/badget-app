import type { LucideIcon } from "lucide-react";
import {
  BanknoteIcon,
  BuildingIcon,
  CandlestickChartIcon,
  CreditCardIcon,
  LayersIcon,
  LayoutGrid,
  LeafIcon,
  ShapesIcon,
  Users,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
  enabled?: boolean;
  badge?: string;
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/",
          label: "Dashboard",
          active: pathname.includes("/dashboard"),
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "",
          label: "Banking",
          active: pathname.includes("/banking"),
          icon: LayersIcon,
          submenus: [
            {
              href: "/banking/transactions",
              label: "Transazioni",
              active: pathname === "/banking/transactions",
            },
          ],
        },
        {
          href: "",
          label: "Savings",
          active: pathname.includes("/savings"),
          icon: LeafIcon,
          submenus: [
            {
              href: "/savings/pension",
              label: "Pensione",
              active: pathname === "/savings/pension",
            },
          ],
        },
        {
          href: "/investments",
          label: "Investimenti",
          active: pathname.includes("/investments"),
          icon: CandlestickChartIcon,
          enabled: false,
          badge: "soon",
          submenus: [],
        },
        {
          href: "/assets",
          label: "Assets",
          active: pathname.includes("/assets"),
          icon: BuildingIcon,
          enabled: false,
          badge: "soon",
          submenus: [],
        },
        {
          href: "/liabilities",
          label: "Liabilities",
          active: pathname.includes("/liabilities"),
          icon: CreditCardIcon,
          enabled: false,
          badge: "soon",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Impostazioni",
      menus: [
        {
          href: "/settings/profile",
          label: "Profilo",
          active: pathname.includes("/users"),
          icon: Users,
          submenus: [],
        },
        {
          href: "/settings/accounts",
          label: "Accounts",
          active: pathname.includes("/settings/accounts"),
          icon: BanknoteIcon,
          submenus: [],
        },
        {
          href: "/settings/categories",
          label: "Categorie",
          active: pathname.includes("/settings/categories"),
          icon: ShapesIcon,
          submenus: [],
        },
      ],
    },
  ];
}
