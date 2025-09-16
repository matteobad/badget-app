import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import {
  CandlestickChartIcon,
  ChevronDownIcon,
  GoalIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  LeafIcon,
  ReceiptIcon,
  Settings2Icon,
  VaultIcon,
  WalletIcon,
} from "lucide-react";

const icons = {
  "/overview": () => <LayoutDashboardIcon size={20} />,
  "/accounts": () => <LandmarkIcon size={20} />,
  "/transactions": () => <ReceiptIcon size={20} />,
  "/budgeting": () => <GoalIcon size={20} />,
  "/vault": () => <VaultIcon size={20} />,
  "/pension": () => <LeafIcon size={20} />,
  "/investments": () => <CandlestickChartIcon size={20} />,
  "/wealth": () => <WalletIcon size={20} />,
  "/settings": () => <Settings2Icon size={20} />,
} as const;

const items = [
  {
    path: "/overview",
    name: "Overview",
  },
  {
    path: "/accounts",
    name: "Accounts",
    children: [
      {
        path: "/accounts?step=connect",
        name: "Connect",
      },
      {
        path: "/accounts?createBankAccount=true",
        name: "Create new",
      },
    ],
  },
  {
    path: "/transactions",
    name: "Transactions",
    children: [
      {
        path: "/transactions/categories",
        name: "Categories",
      },
      {
        path: "/transactions/tags",
        name: "Tags",
      },
      {
        path: "/transactions?importTransaction=true",
        name: "Import",
      },
      {
        path: "/transactions?createTransaction=true",
        name: "Create new",
      },
    ],
  },
  {
    path: "/budgeting",
    name: "Budgeting",
  },
  // {
  //   path: "/pension",
  //   name: "Pension",
  //   children: [
  //     { path: "/pension?createPensionFund=true", name: "Create new" },
  //     { path: "/pension?addContribution=true", name: "Add contribution" },
  //   ],
  // },
  // {
  //   path: "/investments",
  //   name: "Investments",
  //   // children: [
  //   //   { path: "/investments/stocks", name: "Stocks" },
  //   //   { path: "/investments/crypto", name: "Crypto" },
  //   // ],
  // },
  // {
  //   path: "/wealth",
  //   name: "Wealth",
  //   // children: [
  //   //   { path: "/wealth/assets", name: "Beni patrimoniali" },
  //   //   { path: "/wealth/liabilities", name: "Passività" },
  //   // ],
  // },
  // {
  //   path: "/vault",
  //   name: "Vault",
  // },
  {
    path: "/settings",
    name: "Settings",
    children: [
      { path: "/settings", name: "General" },
      { path: "/settings/billing", name: "Billing" },
      { path: "/settings/accounts", name: "Bank Connections" },
      { path: "/settings/notifications", name: "Notifications" },
    ],
  },
];

interface ItemProps {
  item: {
    path: string;
    name: string;
    children?: { path: string; name: string }[];
  };
  isActive: boolean;
  isExpanded: boolean;
  isItemExpanded: boolean;
  onToggle: (path: string) => void;
  onSelect?: () => void;
}

const ChildItem = ({
  child,
  isActive,
  isExpanded,
  shouldShow,
  onSelect,
  index,
}: {
  child: { path: string; name: string };
  isActive: boolean;
  isExpanded: boolean;
  shouldShow: boolean;
  onSelect?: () => void;
  index: number;
}) => {
  const showChild = isExpanded && shouldShow;

  return (
    <Link
      prefetch
      href={child.path}
      onClick={() => onSelect?.()}
      className="group"
    >
      <div className="relative">
        {/* Child item text */}
        <div
          className={cn(
            "mr-[15px] ml-[35px] flex h-[32px] items-center",
            "border-l border-[#DCDAD2] pl-3 dark:border-[#2C2C2C]",
            "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
            showChild
              ? "translate-x-0 opacity-100"
              : "-translate-x-2 opacity-0",
          )}
          style={{
            transitionDelay: showChild
              ? `${40 + index * 20}ms`
              : `${index * 20}ms`,
          }}
        >
          <span
            className={cn(
              "text-xs font-medium transition-colors duration-200",
              "text-[#888] group-hover/child:text-primary",
              "overflow-hidden whitespace-nowrap",
              isActive && "text-primary",
            )}
          >
            {child.name}
          </span>
        </div>
      </div>
    </Link>
  );
};

const Item = ({
  item,
  isActive,
  isExpanded,
  isItemExpanded,
  onToggle,
  onSelect,
}: ItemProps) => {
  const Icon = icons[item.path as keyof typeof icons];
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;

  // Children should be visible when: expanded sidebar AND this item is expanded
  const shouldShowChildren = isExpanded && isItemExpanded;

  const handleChevronClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(item.path);
  };

  return (
    <div className="group">
      <Link
        prefetch
        href={item.path}
        onClick={() => onSelect?.()}
        className="group"
      >
        <div className="relative">
          {/* Background that expands */}
          <div
            className={cn(
              "ease-&lsqb;cubic-bezier(0.4,0,0.2,1)&rsqb; mr-[15px] ml-[15px] h-[40px] border border-transparent transition-all duration-200",
              isActive &&
                "border-[#DCDAD2] bg-[#F2F1EF] dark:border-[#2C2C2C] dark:bg-secondary",
              isExpanded ? "w-[calc(100%-30px)]" : "w-[40px]",
            )}
          />

          {/* Icon - always in same position from sidebar edge */}
          <div className="pointer-events-none absolute top-0 left-[15px] flex h-[40px] w-[40px] items-center justify-center text-black group-hover:!text-primary dark:text-[#666666]">
            <div className={cn(isActive && "dark:!text-white")}>
              <Icon />
            </div>
          </div>

          {isExpanded && (
            <div className="pointer-events-none absolute top-0 right-[8px] left-[55px] flex h-[40px] items-center justify-between">
              <span
                className={cn(
                  "text-sm font-medium text-[#666] transition-opacity duration-200 ease-in-out group-hover:text-primary",
                  "overflow-hidden whitespace-nowrap",
                  hasChildren ? "pr-2" : "",
                  isActive && "text-primary",
                )}
              >
                {item.name}
              </span>
              {hasChildren && (
                <button
                  type="button"
                  onClick={handleChevronClick}
                  className={cn(
                    "mr-3 ml-auto flex h-8 w-8 items-center justify-center transition-all duration-200",
                    "pointer-events-auto text-[#888] hover:text-primary",
                    isActive && "text-primary/60",
                    shouldShowChildren && "rotate-180",
                  )}
                >
                  <ChevronDownIcon size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Children */}
      {hasChildren && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            shouldShowChildren ? "mt-1 max-h-96" : "max-h-0",
          )}
        >
          {item.children!.map((child, index) => {
            const isChildActive = pathname === child.path;
            return (
              <ChildItem
                key={child.path}
                child={child}
                isActive={isChildActive}
                isExpanded={isExpanded}
                shouldShow={shouldShowChildren}
                onSelect={onSelect}
                index={index}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

type Props = {
  onSelect?: () => void;
  isExpanded?: boolean;
};

export function MainMenu({ onSelect, isExpanded = false }: Props) {
  const pathname = usePathname();
  const part = pathname?.split("/")[1];
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Reset expanded item when sidebar expands/collapses
  useEffect(() => {
    setExpandedItem(null);
  }, [isExpanded]);

  return (
    <div className="mt-6 w-full">
      <nav className="w-full">
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const isActive =
              (pathname === "/" && item.path === "/") ||
              (pathname !== "/" && item.path.startsWith(`/${part}`));

            return (
              <Item
                key={item.path}
                item={item}
                isActive={isActive}
                isExpanded={isExpanded}
                isItemExpanded={expandedItem === item.path}
                onToggle={(path) => {
                  setExpandedItem(expandedItem === path ? null : path);
                }}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      </nav>
    </div>
  );
}
