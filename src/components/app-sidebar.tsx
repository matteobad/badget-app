"use client";

import * as React from "react";
import {
  CandlestickChart,
  Layers,
  LifeBuoy,
  Link2,
  ListTodo,
  PiggyBank,
  Send,
  Settings,
  Shapes,
  Sprout,
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
import { NavSettings } from "./nav-settings";
import { TeamSwitcher } from "./team-switcher";

const data = {
  navMain: [
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
        {
          title: "Passività",
          url: "/banking/liabilities",
        },
      ],
    },
    {
      title: "Risparmi",
      url: "/saving",
      icon: PiggyBank,
      items: [
        {
          title: "Obiettivi",
          url: "/saving/goals",
        },
        {
          title: "Fondo emergenza",
          url: "/saving/emergency",
        },
      ],
    },
    {
      title: "Pensione",
      url: "/pension",
      icon: Sprout,
      items: [
        {
          title: "Sociale (INPS)",
          url: "/pension/inps",
        },
        {
          title: "Complementare (fondi)",
          url: "/pension/simulations",
        },
        {
          title: "Simulatore",
          url: "/pension/simulations",
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
          url: "/investments/stocks",
        },
        {
          title: "Obbligazioni",
          url: "/investments/bonds",
        },
        {
          title: "Fondi",
          url: "/investments/funds",
        },
        {
          title: "Crypto",
          url: "/investments/cryptos",
        },
      ],
    },
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
      name: "Budgets",
      url: "/settings/budgets",
      icon: ListTodo,
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
        <NavSettings settings={data.settings} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
