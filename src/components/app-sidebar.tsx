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
      icon: Sprout,
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
  navPrimary: [
    {
      title: "Assets",
      url: "/settings/accounts",
      icon: Link2,
    },
    {
      title: "Liabilities",
      url: "/settings/categories",
      icon: Shapes,
    },
    {
      title: "Previdenza",
      url: "/settings/budgets",
      icon: ListTodo,
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
        <NavMain header="Pilastri" items={data.navMain} />
        <NavMain header="Patrimonio" items={data.navPrimary} />
        <NavSettings settings={data.settings} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
