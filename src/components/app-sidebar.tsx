"use client";

import * as React from "react";
import {
  CalendarClockIcon,
  CandlestickChart,
  CreditCardIcon,
  CuboidIcon,
  Layers,
  LayoutDashboardIcon,
  LifeBuoy,
  Link2,
  ListTodoIcon,
  PiggyBank,
  Send,
  Settings,
  Shapes,
} from "lucide-react";

import { NavMain } from "~/components/nav-main";
import { NavSecondary } from "~/components/nav-secondary";
import { NavUser } from "~/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "~/components/ui/sidebar";
import { NavExtras } from "./nav-extras";
import { NavPillars } from "./nav-pillars";
import { NavSettings } from "./nav-settings";
import { TeamSwitcher } from "./team-switcher";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Budgets",
      url: "/budgets",
      icon: ListTodoIcon,
    },
  ],
  navPillars: [
    {
      title: "Liquidità",
      url: "/banking",
      icon: Layers,
      isActive: true,
      items: [
        {
          title: "Conti corrente",
          url: "/banking/accounts",
        },
        {
          title: "Transazioni",
          url: "/banking/transactions",
        },
      ],
    },
    {
      title: "Fondo emergenza",
      url: "#",
      icon: PiggyBank,
      items: [
        {
          title: "Conti deposito",
          url: "#",
        },
        {
          title: "Obbligazioni a breve",
          url: "#",
        },
        {
          title: "EFT monetari",
          url: "#",
        },
      ],
    },
    {
      title: "Spese previste",
      url: "#",
      icon: CalendarClockIcon,
      items: [
        {
          title: "BTP Valore",
          url: "#",
        },
        {
          title: "Obbligazioni",
          url: "#",
        },
      ],
    },
    {
      title: "Investimenti",
      url: "/investments",
      icon: CandlestickChart,
      items: [
        {
          title: "Azioni",
          url: "#",
        },
        {
          title: "Obbligazioni",
          url: "#",
        },
        {
          title: "Fondi",
          url: "#",
        },
        {
          title: "Crypto",
          url: "#",
        },
      ],
    },
  ],
  navExtras: [
    {
      title: "Attività",
      url: "#",
      icon: CuboidIcon,
    },
    {
      title: "Passività",
      url: "#",
      icon: CreditCardIcon,
    },
    // {
    //   title: "Previdenza",
    //   url: "#",
    //   icon: SproutIcon,
    // },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  settings: [
    {
      name: "Collegamenti",
      url: "/settings/accounts",
      icon: Link2,
    },
    {
      name: "Categorie",
      url: "/settings/categories",
      icon: Shapes,
    },
    {
      name: "Preferenze",
      url: "/settings",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavPillars items={data.navPillars} />
        <NavExtras items={data.navExtras} />
        <NavSettings settings={data.settings} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
