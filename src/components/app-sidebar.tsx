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
  ShapesIcon,
} from "lucide-react";

import { NavMain } from "~/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "~/components/ui/sidebar";
import { NavPillars } from "./nav-pillars";
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
    {
      title: "Categorie",
      url: "/categories",
      icon: ShapesIcon,
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
      </SidebarContent>
      <SidebarFooter>
        <span className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Badget. All rights reserved.
        </span>
      </SidebarFooter>
    </Sidebar>
  );
}
