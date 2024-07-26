import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  BanknoteIcon,
  BitcoinIcon,
  Building2Icon,
  BuildingIcon,
  CandlestickChart,
  HandCoinsIcon,
  LayoutDashboardIcon,
  LinkIcon,
  PiggyBankIcon,
  PlusIcon,
  SproutIcon,
  TagIcon,
  TrendingDownIcon,
} from "lucide-react";

import { Button, buttonVariants } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

interface SidebarItemProps {
  title: string;
  label?: string;
  icon: LucideIcon;
  variant: "default" | "ghost";
}

function SidebarItem({ title, label, icon, variant }: SidebarItemProps) {
  const Icon = icon;

  return (
    <Link
      href="#"
      className={cn(
        buttonVariants({ variant, size: "sm" }),
        "w-full px-4",
        variant === "default" &&
          "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
        "justify-start",
      )}
    >
      <Icon className="mr-2 h-4 w-4" />
      {title}
      {label && (
        <span
          className={cn(
            "ml-auto",
            variant === "default" && "text-background dark:text-white",
          )}
        >
          {label}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-2 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button variant="secondary" className="w-full justify-start gap-2">
              <LayoutDashboardIcon className="h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <PlusIcon className="h-4 w-4" />
              Add resource
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-sm text-slate-700">Open Banking</h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <BuildingIcon className="h-4 w-4" />
              Accounts
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <TagIcon className="h-4 w-4" />
              Categories
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <HandCoinsIcon className="h-4 w-4" />
              Budgets
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <BanknoteIcon className="h-4 w-4" />
              Transactions
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-sm text-slate-700">
            Savings & Investments
          </h2>
          <div className="space-y-1">
            <SidebarItem
              icon={PiggyBankIcon}
              title="Emergency"
              variant="ghost"
              label=""
            />
            <SidebarItem
              icon={SproutIcon}
              title="Pension"
              variant="ghost"
              label="3"
            />
            <SidebarItem
              icon={CandlestickChart}
              title="Investments"
              variant="ghost"
              label=""
            />
            <Button variant="ghost" className="w-full justify-start gap-2">
              <BitcoinIcon className="h-4 w-4" />
              Crypto
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-sm text-slate-700">Others</h2>
          <SidebarItem
            icon={Building2Icon}
            title="Assets"
            variant="ghost"
            label="1"
          />
          <SidebarItem
            icon={TrendingDownIcon}
            title="Liabilities"
            variant="ghost"
            label=""
          />
        </div>
      </div>
    </div>
  );
}
