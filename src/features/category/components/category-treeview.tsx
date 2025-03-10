"use client";

import { use, useMemo } from "react";
import { DownloadIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

import type { TreeViewItem } from "~/components/tree-view";
import TreeView from "~/components/tree-view";
import { categoryIcons } from "~/server/db/data/categories";
import { type getCategories_QUERY } from "../server/queries";

const menuItems = [
  {
    id: "download",
    label: "Download",
    icon: <DownloadIcon className="h-4 w-4" />,
    action: (items: TreeViewItem[]) => console.log("Downloading:", items),
  },
];

export function CategoryTreeview({
  promise,
}: {
  promise: Promise<[Awaited<ReturnType<typeof getCategories_QUERY>>]>;
}) {
  const [categories] = use(promise);

  const handleCheckChange = (item: TreeViewItem, checked: boolean) => {
    console.log(`Item ${item.name} checked:`, checked);
  };

  const data = useMemo<TreeViewItem[]>(() => {
    const roots: TreeViewItem[] = [];

    // First create a map of all categories
    const categoryMap = new Map(
      categories.map((category) => [
        category.id,
        {
          id: category.id,
          name: category.name,
          type: category.icon,
        },
      ]),
    );

    // Build the tree structure
    categories.forEach(({ id, name, parentId, type }) => {
      const current = categoryMap.get(id)!;

      if (parentId && categoryMap.has(parentId)) {
        // If parent exists, add current category as its child
        categoryMap.get(parentId)!.children.push(current);
      } else {
        // If no parent, add to the type-level grouping
        let typeNode = roots.find((node) => node.id === type);
        if (!typeNode) {
          typeNode = { id: type, name: type, children: [], type };
          roots.push(typeNode);
        }
        typeNode.children!.push(current);
      }
    });

    return roots;
  }, [categories]);

  console.log(data);

  const customIconMap = useMemo<Record<string, React.ReactNode>>(() => {
    const result: Record<string, React.ReactNode> = {};
    return categoryIcons.reduce((acc, value) => {
      acc[value] = <DynamicIcon name={value} className="h-4 w-4" />;
      return acc;
    }, result);
  }, []);

  return (
    <TreeView
      data={data}
      title="Tree View Demo"
      iconMap={customIconMap}
      menuItems={menuItems}
      onCheckChange={handleCheckChange}
    />
  );
}
