import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import {
  GoalIcon,
  LayoutDashboardIcon,
  ReceiptIcon,
  Settings2Icon,
} from "lucide-react";

const icons = {
  "/dashboard": () => <LayoutDashboardIcon size={20} />,
  "/transactions": () => <ReceiptIcon size={20} />,
  "/budgeting": () => <GoalIcon size={20} />,
  "/settings": () => <Settings2Icon size={20} />,
} as const;

const items = [
  {
    path: "/dashboard",
    name: "Overview",
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
        path: "/transactions?step=connect",
        name: "Connect bank",
      },
      {
        path: "/transactions?step=import&hide=true",
        name: "Import",
      },
      { path: "/transactions?createTransaction=true", name: "Create new" },
    ],
  },
  {
    path: "/budgeting",
    name: "Budgeting",
    children: [
      { path: "/invoices?statuses=paid", name: "Paid" },
      { path: "/invoices?statuses=unpaid", name: "Unpaid" },
      { path: "/invoices?statuses=overdue", name: "Overdue" },
      { path: "/invoices?statuses=draft", name: "Draft" },
      { path: "/invoices?type=create", name: "Create new" },
    ],
  },
  {
    path: "/settings",
    name: "Settings",
    children: [
      { path: "/settings", name: "General" },
      { path: "/settings/billing", name: "Billing" },
      { path: "/settings/accounts", name: "Bank Connections" },
      { path: "/settings/members", name: "Members" },
      { path: "/settings/notifications", name: "Notifications" },
      { path: "/settings/developer", name: "Developer" },
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
  onSelect?: () => void;
}

const ChildItem = ({
  child,
  isActive,
  isExpanded,
  isParentHovered,
  hasActiveChild,
  isParentActive,
  onSelect,
  index,
}: {
  child: { path: string; name: string };
  isActive: boolean;
  isExpanded: boolean;
  isParentHovered: boolean;
  hasActiveChild: boolean;
  isParentActive: boolean;
  onSelect?: () => void;
  index: number;
}) => {
  const showChild = isExpanded && isParentHovered;
  const shouldSkipAnimation = hasActiveChild || isParentActive;

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
            !shouldSkipAnimation && "transition-all duration-300 ease-in-out",
            showChild
              ? "translate-x-0 opacity-100"
              : "-translate-x-2 opacity-0",
          )}
          style={{
            transitionDelay: shouldSkipAnimation
              ? undefined
              : showChild
                ? `${60 + index * 25}ms`
                : `${(2 - index) * 10}ms`,
          }}
        >
          <span
            className={cn(
              "text-xs font-medium transition-colors duration-200",
              "text-[#888] group-hover:text-primary",
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

const Item = ({ item, isActive, isExpanded, onSelect }: ItemProps) => {
  const Icon = icons[item.path as keyof typeof icons];
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if any child is currently active
  const hasActiveChild = hasChildren
    ? item.children!.some((child) => pathname === child.path)
    : false;
  const shouldShowChildren =
    isExpanded && (isHovered || hasActiveChild || isActive);

  const handleMouseEnter = () => {
    if (hasChildren && !hasActiveChild && !isActive) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, 250);
    } else {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(false);
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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
              "mr-[15px] ml-[15px] h-[40px] border border-transparent transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
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
                  isActive && "text-primary",
                )}
              >
                {item.name}
              </span>
              {hasChildren && (
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center transition-all duration-200",
                    "text-[#888] group-hover:text-primary/60",
                    isActive && "text-primary/60",
                    isHovered && !hasActiveChild && !isActive && "rotate-180",
                  )}
                />
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Children */}
      {hasChildren && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
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
                isParentHovered={isHovered || hasActiveChild || isActive}
                hasActiveChild={hasActiveChild}
                isParentActive={isActive}
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
                onSelect={onSelect}
              />
            );
          })}
        </div>
      </nav>
    </div>
  );
}
