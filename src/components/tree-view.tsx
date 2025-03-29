"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Box,
  ChevronRight,
  EllipsisVerticalIcon,
  Folder,
  Info,
  RefreshCwIcon,
  UnlinkIcon,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { cn } from "~/lib/utils";
import { type DB_BudgetType } from "~/server/db/schema/budgets";
import { CATEGORY_TYPE } from "~/server/db/schema/enum";
import { formatAmount } from "~/utils/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export interface TreeViewItem {
  id: string;
  name: string;
  type: string;
  icon: string;
  budgets: DB_BudgetType[];
  children?: TreeViewItem[];
}

export type TreeViewIconMap = Record<string, React.ReactNode | undefined>;

export interface TreeViewMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: (items: TreeViewItem[]) => void;
}

export interface TreeViewProps {
  className?: string;
  data: TreeViewItem[];
  title?: string;
  selectionText?: string;
  getIcon?: (item: TreeViewItem, depth: number) => React.ReactNode;
  onSelectionChange?: (selectedItems: TreeViewItem[]) => void;
  onAction?: (action: string, items: TreeViewItem[]) => void;
  iconMap?: TreeViewIconMap;
  menuItems?: TreeViewMenuItem[];
}

interface TreeItemProps {
  item: TreeViewItem;
  depth?: number;
  selectedIds: Set<string>;
  lastSelectedId: React.MutableRefObject<string | null>;
  onSelect: (ids: Set<string>) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string, isOpen: boolean) => void;
  getIcon?: (item: TreeViewItem, depth: number) => React.ReactNode;
  onAction?: (action: string, items: TreeViewItem[]) => void;
  onAccessChange?: (item: TreeViewItem, hasAccess: boolean) => void;
  allItems: TreeViewItem[];
  showAccessRights?: boolean;
  itemMap: Map<string, TreeViewItem>;
  iconMap?: TreeViewIconMap;
  menuItems?: TreeViewMenuItem[];
  getSelectedItems: () => TreeViewItem[];
}

// Helper function to build a map of all items by ID
const buildItemMap = (items: TreeViewItem[]): Map<string, TreeViewItem> => {
  const map = new Map<string, TreeViewItem>();
  const processItem = (item: TreeViewItem) => {
    map.set(item.id, item);
    item.children?.forEach(processItem);
  };
  items.forEach(processItem);
  return map;
};

// Add this default icon map
const defaultIconMap: TreeViewIconMap = {
  file: <Box className="h-4 w-4 text-red-600" />,
  folder: <Folder className="h-4 w-4 text-primary/80" />,
};

function TreeItem({
  item,
  depth = 0,
  selectedIds,
  lastSelectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
  getIcon,
  onAction,
  onAccessChange,
  allItems,
  showAccessRights,
  itemMap,
  iconMap = defaultIconMap,
  menuItems,
  getSelectedItems,
}: TreeItemProps): JSX.Element {
  const isOpen = expandedIds.has(item.id);
  const isSelected = selectedIds.has(item.id);
  const itemRef = useRef<HTMLDivElement>(null);

  // Get all visible items in order
  const getVisibleItems = useCallback(
    (items: TreeViewItem[]): TreeViewItem[] => {
      let visibleItems: TreeViewItem[] = [];

      items.forEach((item) => {
        visibleItems.push(item);
        if (item.children && expandedIds.has(item.id)) {
          visibleItems = [...visibleItems, ...getVisibleItems(item.children)];
        }
      });

      return visibleItems;
    },
    [expandedIds],
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    let newSelection = new Set(selectedIds);

    if (!itemRef.current) return;

    if (e.shiftKey && lastSelectedId.current !== null) {
      const items = Array.from(document.querySelectorAll("[data-tree-item]"));
      const lastIndex = items.findIndex(
        (el) => el.getAttribute("data-id") === lastSelectedId.current,
      );
      const currentIndex = items.findIndex((el) => el === itemRef.current);
      const [start, end] = [
        Math.min(lastIndex, currentIndex),
        Math.max(lastIndex, currentIndex),
      ];

      items.slice(start, end + 1).forEach((el) => {
        const id = el.getAttribute("data-id");
        const parentFolderClosed = el.closest('[data-folder-closed="true"]');
        const isClosedFolder = el.getAttribute("data-folder-closed") === "true";

        if (id && (isClosedFolder || !parentFolderClosed)) {
          newSelection.add(id);
        }
      });
    } else if (e.ctrlKey || e.metaKey) {
      if (newSelection.has(item.id)) {
        newSelection.delete(item.id);
      } else {
        newSelection.add(item.id);
      }
    } else {
      newSelection = new Set([item.id]);
      // Open folder on single click if it's a folder
      if (item.children && isSelected) {
        onToggleExpand(item.id, !isOpen);
      }
    }

    lastSelectedId.current = item.id;
    onSelect(newSelection);
  };

  const renderIcon = () => {
    if (getIcon) {
      return getIcon(item, depth);
    }

    // Use the provided iconMap or fall back to default
    return iconMap[item.icon] ?? iconMap.folder ?? defaultIconMap.folder;
  };

  const getItemPath = (item: TreeViewItem, items: TreeViewItem[]): string => {
    const path: string[] = [item.name];

    const findParent = (
      currentItem: TreeViewItem,
      allItems: TreeViewItem[],
    ) => {
      for (const potentialParent of allItems) {
        if (
          potentialParent.children?.some((child) => child.id === currentItem.id)
        ) {
          path.unshift(potentialParent.name);
          findParent(potentialParent, allItems);
          break;
        }
        if (potentialParent.children) {
          findParent(currentItem, potentialParent.children);
        }
      }
    };

    findParent(item, items);
    return path.join(" → ");
  };

  // Add function to count selected items in a folder
  const getSelectedChildrenCount = (item: TreeViewItem): number => {
    let count = 0;

    if (!item.children) return 0;

    item.children.forEach((child) => {
      if (selectedIds.has(child.id)) {
        count++;
      }
      if (child.children) {
        count += getSelectedChildrenCount(child);
      }
    });

    return count;
  };

  // Get selected count only if item has children and is collapsed
  const selectedCount =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    (item.children && !isOpen && getSelectedChildrenCount(item)) || null;

  return (
    <div>
      <div
        ref={itemRef}
        data-tree-item
        data-id={item.id}
        data-depth={depth}
        data-folder-closed={item.children && !isOpen}
        className={cn("cursor-pointer select-none", {
          "bg-orange-100": isSelected,
          "text-foreground": !isSelected,
        })}
        style={{ paddingLeft: `${depth * 30}px` }}
        onClick={handleClick}
      >
        <div className="flex h-8 items-center">
          {item.children ? (
            <div className="group flex flex-1 items-center gap-2">
              <Collapsible
                open={isOpen}
                onOpenChange={(open) => onToggleExpand(item.id, open)}
              >
                <CollapsibleTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon" className="size-6">
                    <motion.div
                      initial={false}
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
              {renderIcon()}
              <span className="flex-1 pl-1 whitespace-nowrap">{item.name}</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 items-center justify-center p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{item.name}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {item.type.charAt(0).toUpperCase() +
                          item.type.slice(1).replace("_", " ")}
                      </div>
                      <div>
                        <span className="font-medium">ID:</span> {item.id}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span>{" "}
                        {getItemPath(item, allItems)}
                      </div>
                      <div>
                        <span className="font-medium">Items:</span>{" "}
                        {item.children?.length || 0} direct items
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
              {selectedCount !== null && selectedCount > 0 && (
                <Badge
                  variant="secondary"
                  className="mr-2 bg-blue-100 hover:bg-blue-100"
                >
                  {selectedCount} selected
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="size-6 p-0">
                    <span className="sr-only">Open menu</span>
                    <EllipsisVerticalIcon className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <RefreshCwIcon className="size-3" />
                    Modifica
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <UnlinkIcon className="size-3" />
                    Elimina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="group flex flex-1 items-center gap-2">
              <div className="flex size-6 items-center justify-center">
                <span
                  className={cn("size-1.5 rounded-full bg-slate-200", {
                    "bg-green-200": item.type === CATEGORY_TYPE.INCOME,
                    "bg-red-200": item.type === CATEGORY_TYPE.EXPENSE,
                    "bg-violet-200": item.type === CATEGORY_TYPE.SAVINGS,
                    "bg-blue-200": item.type === CATEGORY_TYPE.INVESTMENT,
                    "bg-neutral-200": item.type === CATEGORY_TYPE.TRANSFER,
                  })}
                ></span>
              </div>
              {renderIcon()}
              <span className="flex-1 pl-1 whitespace-nowrap">{item.name}</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 items-center justify-center p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{item.name}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {item.type.charAt(0).toUpperCase() +
                          item.type.slice(1).replace("_", " ")}
                      </div>
                      <div>
                        <span className="font-medium">ID:</span> {item.id}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span>{" "}
                        {getItemPath(item, allItems)}
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>

              <div className="flex items-center gap-4">
                {item.budgets.length > 1 && (
                  <Badge variant="secondary">
                    {item.budgets.length + " budgets"}
                  </Badge>
                )}

                <span className="w-[80px] text-right font-mono">
                  {item.budgets[0]?.amount
                    ? formatAmount({
                        amount: parseFloat(item.budgets[0].amount),
                        maximumFractionDigits: 0,
                      })
                    : "n/a"}
                </span>
                <span className="w-[30px] font-mono text-xs text-muted-foreground">
                  100%
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-6 p-0">
                      <span className="sr-only">Open menu</span>
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <RefreshCwIcon className="size-3" />
                      Modifica
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <UnlinkIcon className="size-3" />
                      Elimina
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
      </div>

      {item.children && (
        <Collapsible
          open={isOpen}
          onOpenChange={(open) => onToggleExpand(item.id, open)}
        >
          <AnimatePresence initial={false}>
            {isOpen && (
              <CollapsibleContent forceMount asChild>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.05 }}
                >
                  {item.children?.map((child) => (
                    <TreeItem
                      key={child.id}
                      item={child}
                      depth={depth + 1}
                      selectedIds={selectedIds}
                      lastSelectedId={lastSelectedId}
                      onSelect={onSelect}
                      expandedIds={expandedIds}
                      onToggleExpand={onToggleExpand}
                      getIcon={getIcon}
                      onAction={onAction}
                      onAccessChange={onAccessChange}
                      allItems={allItems}
                      showAccessRights={showAccessRights}
                      itemMap={itemMap}
                      iconMap={iconMap}
                      menuItems={menuItems}
                      getSelectedItems={getSelectedItems}
                    />
                  ))}
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Collapsible>
      )}
    </div>
  );
}

export default function TreeView({
  className,
  data,
  iconMap,
  getIcon,
  onSelectionChange,
  onAction,
  menuItems,
}: TreeViewProps) {
  const [currentMousePos, setCurrentMousePos] = useState<number>(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragStartPosition, setDragStartPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery] = useState("");

  const dragRef = useRef<HTMLDivElement>(null);
  const lastSelectedId = useRef<string | null>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  const DRAG_THRESHOLD = 10; // pixels

  // Create a map of all items by ID
  const itemMap = useMemo(() => buildItemMap(data), [data]);

  // Memoize the search results and expanded IDs
  const { filteredData } = useMemo(() => {
    if (!searchQuery.trim()) {
      return { filteredData: data, searchExpandedIds: new Set<string>() };
    }

    const searchLower = searchQuery.toLowerCase();
    const newExpandedIds = new Set<string>();

    // Helper function to check if an item or its descendants match the search
    const itemMatches = (item: TreeViewItem): boolean => {
      const nameMatches = item.name.toLowerCase().includes(searchLower);
      if (nameMatches) return true;

      if (item.children) {
        return item.children.some((child) => itemMatches(child));
      }

      return false;
    };

    // Helper function to filter tree while keeping parent structure
    const filterTree = (items: TreeViewItem[]): TreeViewItem[] => {
      return items
        .map((item) => {
          if (!item.children) {
            return itemMatches(item) ? item : null;
          }

          const filteredChildren = filterTree(item.children);
          if (filteredChildren.length > 0 || itemMatches(item)) {
            if (item.children) {
              newExpandedIds.add(item.id);
            }
            return {
              ...item,
              children: filteredChildren,
            };
          }
          return null;
        })
        .filter((item): item is TreeViewItem => item !== null);
    };

    return {
      filteredData: filterTree(data),
      searchExpandedIds: newExpandedIds,
    };
  }, [data, searchQuery]);

  // Memoize the items count
  const { itemsCount } = useMemo(() => {
    const countItems = (items: TreeViewItem[]): number => {
      return items.reduce((count, item) => {
        // Count current item
        let itemCount = 1;
        // Recursively count children if they exist
        if (item.children?.length) {
          itemCount += countItems(item.children);
        }
        return count + itemCount;
      }, 0);
    };

    return {
      itemsCount: countItems(data),
    };
  }, [data]);

  useEffect(() => {
    const getAllFolderIds = (items: TreeViewItem[]): string[] => {
      let ids: string[] = [];
      items.forEach((item) => {
        if (item.children) {
          ids.push(item.id);
          ids = [...ids, ...getAllFolderIds(item.children)];
        }
      });
      return ids;
    };

    const handleClickAway = (e: MouseEvent) => {
      const target = e.target as Element;

      const clickedInside =
        treeRef.current?.contains(target) ??
        dragRef.current?.contains(target) ??
        // Ignore clicks on context menus
        target.closest('[role="menu"]') ??
        target.closest("[data-radix-popper-content-wrapper]");

      if (!clickedInside) {
        setSelectedIds(new Set());
        lastSelectedId.current = null;
      }
    };

    setExpandedIds(new Set(getAllFolderIds(data)));

    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleExpand = (id: string, isOpen: boolean) => {
    const newExpandedIds = new Set(expandedIds);
    if (isOpen) {
      newExpandedIds.add(id);
    } else {
      newExpandedIds.delete(id);
    }
    setExpandedIds(newExpandedIds);
  };

  // Get selected items
  const getSelectedItems = useCallback((): TreeViewItem[] => {
    const items: TreeViewItem[] = [];
    const processItem = (item: TreeViewItem) => {
      if (selectedIds.has(item.id)) {
        items.push(item);
      }
      item.children?.forEach(processItem);
    };
    data.forEach(processItem);
    return items;
  }, [selectedIds, data]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only track on left click and not on buttons
    if (e.button !== 0 || (e.target as HTMLElement).closest("button")) return;

    setDragStartPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Check if primary button is still held down
      if (!(e.buttons & 1)) {
        setIsDragging(false);
        setDragStart(null);
        setDragStartPosition(null);
        return;
      }

      // If we haven't registered a potential drag start position, ignore
      if (!dragStartPosition) return;

      // Calculate distance moved
      const deltaX = e.clientX - dragStartPosition.x;
      const deltaY = e.clientY - dragStartPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // If we haven't started dragging yet, check if we should start
      if (!isDragging) {
        if (distance > DRAG_THRESHOLD) {
          setIsDragging(true);
          setDragStart(dragStartPosition.y);

          // Clear selection if not holding shift/ctrl
          if (!e.shiftKey && !e.ctrlKey) {
            setSelectedIds(new Set());
            lastSelectedId.current = null;
          }
        }
        return;
      }

      // Rest of the existing drag logic
      if (!dragRef.current) return;

      const items = Array.from(
        dragRef.current.querySelectorAll("[data-tree-item]"),
      );

      const startY = dragStart;
      const currentY = e.clientY;
      const [selectionStart, selectionEnd] = [
        Math.min(startY ?? 0, currentY),
        Math.max(startY ?? 0, currentY),
      ];

      const newSelection = new Set(
        e.shiftKey || e.ctrlKey ? Array.from(selectedIds) : [],
      );

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const itemTop = rect.top;
        const itemBottom = rect.top + rect.height;

        if (itemBottom >= selectionStart && itemTop <= selectionEnd) {
          const id = item.getAttribute("data-id");
          const isClosedFolder =
            item.getAttribute("data-folder-closed") === "true";
          const parentFolderClosed = item.closest(
            '[data-folder-closed="true"]',
          );

          if (id && (isClosedFolder || !parentFolderClosed)) {
            newSelection.add(id);
          }
        }
      });

      setSelectedIds(newSelection);
      setCurrentMousePos(e.clientY);
    },
    [isDragging, dragStart, selectedIds, dragStartPosition],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setDragStartPosition(null);
  }, []);

  // Add cleanup for mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mouseleave", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [isDragging, handleMouseUp]);

  // Call onSelectionChange when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(getSelectedItems());
    }
  }, [selectedIds, onSelectionChange, getSelectedItems]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Hai configurato {itemsCount} categorie
        </span>
        <span className="pr-[86px] font-mono text-sm text-muted-foreground">
          Budget
        </span>
      </div>
      <div ref={treeRef} className="relative w-full max-w-2xl">
        <div
          ref={dragRef}
          className={cn("relative select-none", className)}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          {isDragging && (
            <div
              className="pointer-events-none absolute inset-0 bg-blue-500/0"
              style={{
                top: Math.min(
                  dragStart ?? 0,
                  dragStart === null ? 0 : currentMousePos,
                ),
                height: Math.abs(
                  (dragStart ?? 0) - (dragStart === null ? 0 : currentMousePos),
                ),
              }}
            />
          )}
          {filteredData.map((item) => (
            <TreeItem
              key={item.id}
              item={item}
              selectedIds={selectedIds}
              lastSelectedId={lastSelectedId}
              onSelect={setSelectedIds}
              expandedIds={expandedIds}
              onToggleExpand={handleToggleExpand}
              getIcon={getIcon}
              onAction={onAction}
              allItems={data}
              itemMap={itemMap}
              iconMap={iconMap}
              menuItems={menuItems}
              getSelectedItems={getSelectedItems}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
