"use client";

import {
  Atom,
  Building2,
  CandlestickChart,
  CreditCard,
  Cross,
  Eclipse,
  Layers,
  LayoutDashboard,
  Link,
  PiggyBank,
  Rabbit,
  Receipt,
  Send,
  Shapes,
  Sprout,
  User,
} from "lucide-react";

import { NavMain } from "~/components/nav-main";
import { NavProjects } from "~/components/nav-projects";
import { NavSecondary } from "~/components/nav-secondary";
import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
} from "~/components/ui/sidebar";
import { OnboardingCard } from "./onboarding-card";

const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: Atom,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: Eclipse,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Rabbit,
      plan: "Free",
    },
  ],
  navLead: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      enabled: true,
    },
  ],
  navMain: [
    {
      title: "Banking",
      url: "#",
      icon: Layers,
      isActive: true,
      enabled: true,
      items: [
        {
          title: "Transazioni",
          url: "/transactions",
          icon: Receipt,
          description: "Vedi le tue transazioni",
        },
      ],
    },
    {
      title: "Risparmi",
      url: "#",
      icon: PiggyBank,
      enabled: true,
      items: [
        {
          title: "Obiettivi",
          url: "#",
          icon: PiggyBank,
          description: "Obiettivi di risparmio",
        },
        {
          title: "Fondo di emergenza",
          url: "#",
          icon: Cross,
          description: "Performance and speed for efficiency.",
        },
      ],
    },
    {
      title: "Pensione",
      url: "#",
      icon: Sprout,
      enabled: true,
    },
    {
      title: "Investimenti",
      url: "#",
      icon: CandlestickChart,
      enabled: false,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Assets",
      url: "#",
      icon: Building2,
      enabled: false,
    },
    {
      title: "Liabilities",
      url: "#",
      icon: CreditCard,
      enabled: false,
    },
  ],
  navSecondary: [
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  settings: [
    {
      name: "Profilo",
      url: "/settings/profile",
      icon: User,
    },
    {
      name: "Collegamenti",
      url: "/settings/accounts",
      icon: Link,
    },
    {
      name: "Categorie",
      url: "/settings/categories",
      icon: Shapes,
    },
  ],
};

export async function AppSidebar({
  notificationCard,
}: {
  notificationCard: React.ReactNode;
}) {
  return (
    <Sidebar>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarItem>
          <NavMain items={data.navLead} />
        </SidebarItem>
        <SidebarItem>
          <SidebarLabel>Platform</SidebarLabel>
          <NavMain items={data.navMain} />
        </SidebarItem>
        <SidebarItem>
          <SidebarLabel>Impostazioni</SidebarLabel>
          <NavProjects settings={data.settings} />
        </SidebarItem>
        <SidebarItem className="mt-auto">
          <SidebarLabel>Help</SidebarLabel>
          <NavSecondary items={data.navSecondary} />
        </SidebarItem>
        <SidebarItem>{notificationCard}</SidebarItem>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
