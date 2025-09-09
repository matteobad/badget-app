import type { CategoryWithChildren } from "~/shared/helpers/categories";
import type { dynamicIconImports } from "lucide-react/dynamic";
import React, { useEffect, useState } from "react";
import {
  expandAllFeature,
  hotkeysCoreFeature,
  searchFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { Checkbox } from "~/components/ui/checkbox";
import { Tree, TreeItem, TreeItemLabel } from "~/components/ui/tree";
import { DynamicIcon } from "lucide-react/dynamic";

import type { TreeState } from "@headless-tree/core";

const indent = 20;

type CategoryTreeProps = {
  items: Record<string, CategoryWithChildren>;
  searchValue: string | null;
  checkboxes?: boolean;
  selectedItems?: string[];
  onSelect?: (categoryId: string) => void;
};

export function CategoryTree({
  items,
  searchValue,
  checkboxes,
  selectedItems,
  onSelect,
}: CategoryTreeProps) {
  const [state, setState] = useState<Partial<TreeState<CategoryWithChildren>>>({
    selectedItems: selectedItems,
  });
  // Keep track of filtered items separately from the tree's internal search state
  const [filteredItems, setFilteredItems] = useState<string[]>([]);

  const tree = useTree<CategoryWithChildren>({
    state,
    setState,
    indent,
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) => items[itemId]!,
      getChildren: (itemId) => items[itemId]?.children ?? [],
    },
    onPrimaryAction(item) {
      onSelect?.(item.getItemMeta().itemId);
    },
    // canCheckFolders: true,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      // checkboxesFeature,
      hotkeysCoreFeature,
      searchFeature,
      expandAllFeature,
    ],
  });

  useEffect(() => {
    tree.rebuildTree();
    void tree.expandAll();
  }, [items, tree]);

  // This function determines if an item should be visible based on our custom filtering
  const shouldShowItem = (itemId: string) => {
    if (!searchValue || searchValue.length === 0) return true;
    return filteredItems.includes(itemId);
  };

  // Update filtered items when search value changes
  useEffect(() => {
    if (!searchValue || searchValue.length === 0) {
      setFilteredItems([]);
      return;
    }

    // Get all items
    const allItems = tree.getItems();

    // First, find direct matches
    const directMatches = allItems
      .filter((item) => {
        const name = item.getItemName().toLowerCase();
        return name.includes(searchValue.toLowerCase());
      })
      .map((item) => item.getId());

    // Then, find all parent IDs of matching items
    const parentIds = new Set<string>();
    directMatches.forEach((matchId) => {
      let item = tree.getItems().find((i) => i.getId() === matchId);
      while (item?.getParent()) {
        const parent = item.getParent();
        if (parent) {
          parentIds.add(parent.getId());
          item = parent;
        } else {
          break;
        }
      }
    });

    // Find all children of matching items
    const childrenIds = new Set<string>();
    directMatches.forEach((matchId) => {
      const item = tree.getItems().find((i) => i.getId() === matchId);
      if (item?.isFolder()) {
        // Get all descendants recursively
        const getDescendants = (itemId: string) => {
          const children = items[itemId]?.children ?? [];
          children.forEach((childId) => {
            childrenIds.add(childId);
            if (items[childId]?.children?.length) {
              getDescendants(childId);
            }
          });
        };

        getDescendants(item.getId());
      }
    });

    // Combine direct matches, parents, and children
    setFilteredItems([
      ...directMatches,
      ...Array.from(parentIds),
      ...Array.from(childrenIds),
    ]);

    // Keep all folders expanded during search to ensure all matches are visible
    // Store current expanded state first
    const currentExpandedItems = tree.getState().expandedItems ?? [];

    // Get all folder IDs that need to be expanded to show matches
    const folderIdsToExpand = allItems
      .filter((item) => item.isFolder())
      .map((item) => item.getId());

    // Update expanded items in the tree state
    setState((prevState) => ({
      ...prevState,
      expandedItems: [
        ...new Set([...currentExpandedItems, ...folderIdsToExpand]),
      ],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, tree]);

  return (
    <div className="flex h-full flex-col gap-2 *:first:grow">
      <div>
        <Tree
          className="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
          indent={indent}
          tree={tree}
        >
          {tree.getItems().map((item) => {
            const isVisible = shouldShowItem(item.getId());

            return (
              <div
                key={item.getId()}
                className="flex items-center gap-1.5 not-last:pb-0 data-[visible=false]:hidden"
                data-visible={isVisible || !searchValue}
              >
                {checkboxes && (
                  <Checkbox
                    checked={
                      {
                        checked: true,
                        unchecked: false,
                        indeterminate: "indeterminate" as const,
                      }[item.getCheckedState()]
                    }
                    onCheckedChange={(checked) => {
                      const checkboxProps = item.getCheckboxProps();
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                      checkboxProps.onChange?.({ target: { checked } });
                    }}
                  />
                )}
                <TreeItem
                  item={item}
                  className="flex-1 not-last:pb-0 data-[visible=false]:hidden"
                >
                  <TreeItemLabel className="relative not-in-data-[folder=true]:ps-2 before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background">
                    <span className="flex items-center gap-2">
                      <DynamicIcon
                        name={
                          item.getItemData()
                            .icon as keyof typeof dynamicIconImports
                        }
                        size={16}
                        aria-hidden="true"
                      />
                      <span className="line-clamp-1 text-left">
                        {item.getItemName()}
                      </span>
                    </span>
                  </TreeItemLabel>
                </TreeItem>
              </div>
            );
          })}
        </Tree>
      </div>
    </div>
  );
}
