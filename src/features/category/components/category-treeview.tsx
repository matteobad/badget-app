"use client";

import { use, useMemo } from "react";
import { CircleIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

import type { TreeViewItem } from "~/components/tree-view";
import TreeView from "~/components/tree-view";
import { type getCategories_QUERY } from "../server/queries";

type Category = {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  icon: string | null;
  children: Category[];
};

function mapCategoriesToTreeView(categories: Category[]): TreeViewItem[] {
  return categories.map((cat) => {
    const hasChildren = cat.children.length > 0;

    return {
      id: cat.id,
      name: cat.name,
      type: hasChildren ? cat.children.length.toString() : cat.icon!, // Necessario per il mapping delle icone
      children: hasChildren ? mapCategoriesToTreeView(cat.children) : undefined,
    };
  });
}

function getCategoryIcon(iconName: string | null, childCount: number) {
  console.log(iconName, childCount);
  if (childCount > 0) {
    return (
      <div className="relative flex h-6 w-6 items-center justify-center">
        <CircleIcon className="h-6 w-6 text-gray-400" />
        <span className="absolute text-xs font-bold text-white">
          {childCount}
        </span>
      </div>
    );
  }

  if (iconName) {
    return <DynamicIcon name={iconName} />;
  }

  return null;
}

export function CategoryTreeview({
  promise,
}: {
  promise: Promise<[Awaited<ReturnType<typeof getCategories_QUERY>>]>;
}) {
  const [categories] = use(promise);

  const data = useMemo(() => {
    const categoryMap = new Map<string, Category>(
      categories.map((cat) => [cat.id, { ...cat, children: [] }]),
    );

    const categoryTree: Category[] = [];

    for (const cat of categories) {
      if (!categoryMap.has(cat.id)) continue;

      if (!cat.parentId) {
        categoryTree.push(categoryMap.get(cat.id)!);
      } else {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(cat.id)!);
        }
      }
    }

    return mapCategoriesToTreeView(categoryTree);
  }, [categories]);

  const handleCheckChange = (item: TreeViewItem, checked: boolean) => {
    console.log(`Item ${item.name} checked:`, checked);
  };

  console.log(data);

  const customIconMap = useMemo<Record<string, React.ReactNode>>(() => {
    const result: Record<string, React.ReactNode> = {
      "1": (
        <div className="relative flex size-5 items-center justify-center rounded border border-dashed bg-slate-100">
          <span className="absolute text-xs font-bold">1</span>
        </div>
      ),
      "2": (
        <div className="relative flex size-5 items-center justify-center rounded border border-dashed bg-slate-100">
          <span className="absolute text-xs font-bold">2</span>
        </div>
      ),
      "3": (
        <div className="relative flex size-5 items-center justify-center rounded border border-dashed bg-slate-100">
          <span className="absolute text-xs font-bold">3</span>
        </div>
      ),
    };
    return categories.reduce((acc, value) => {
      acc[value.icon] = (
        <DynamicIcon
          name={value.icon}
          className="h-4 w-4"
          style={{ color: value.color! }}
        />
      );
      return acc;
    }, result);
  }, [categories]);

  return (
    <TreeView
      data={data}
      title="Tree View Demo"
      iconMap={customIconMap}
      onCheckChange={handleCheckChange}
    />
  );
}
