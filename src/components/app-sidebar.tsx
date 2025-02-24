"use client";

import * as React from "react";
import {
  CalendarClockIcon,
  CandlestickChart,
  CreditCardIcon,
  CuboidIcon,
  LandmarkIcon,
  Layers,
  LayoutDashboardIcon,
  LifeBuoy,
  PiggyBank,
  ReceiptIcon,
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
import { NavPillars } from "./nav-pillars";
import { NavSettings } from "./nav-settings";
import { NavWealth } from "./nav-wealth";
import { TeamSwitcher } from "./team-switcher";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Conti",
      url: "/accounts",
      icon: LandmarkIcon,
    },
    {
      title: "Transazioni",
      url: "/transactions",
      icon: ReceiptIcon,
    },
  ],
  navPillars: [
    {
      title: "Liquidità",
      url: "/banking",
      icon: Layers,
    },
    {
      title: "Fondo emergenza",
      url: "#",
      icon: PiggyBank,
    },
    {
      title: "Obiettivi a breve",
      url: "#",
      icon: CalendarClockIcon,
    },
    {
      title: "Investimenti",
      url: "/investments",
      icon: CandlestickChart,
    },
  ],
  navWealth: [
    {
      title: "Beni patrimoniali",
      url: "#",
      icon: CuboidIcon,
    },
    {
      title: "Passività",
      url: "#",
      icon: CreditCardIcon,
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
      name: "Preferenze",
      url: "/settings",
      icon: Settings,
    },
    {
      name: "Categorie",
      url: "/settings/categories",
      icon: Shapes,
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
        <NavWealth items={data.navWealth} />
        <NavSettings settings={data.settings} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
