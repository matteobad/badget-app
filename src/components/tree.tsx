"use client";

import * as React from "react";
import { type ItemInstance } from "@headless-tree/core";
import { cn } from "~/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { Slot } from "radix-ui";

import { Button } from "./ui/button";

interface TreeContextValue<T = any> {
  indent: number;
  currentItem?: ItemInstance<T>;
  tree?: any;
}

const TreeContext = React.createContext<TreeContextValue>({
  indent: 20,
  currentItem: undefined,
  tree: undefined,
});

function useTreeContext<T = any>() {
  return React.useContext(TreeContext) as TreeContextValue<T>;
}

interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
  indent?: number;
  tree?: any;
}

function Tree({ indent = 20, tree, className, ...props }: TreeProps) {
  const containerProps =
    tree && typeof tree.getContainerProps === "function"
      ? tree.getContainerProps()
      : {};
  const mergedProps = { ...props, ...containerProps };

  // Extract style from mergedProps to merge with our custom styles
  const { style: propStyle, ...otherProps } = mergedProps;

  // Merge styles
  const mergedStyle = {
    ...propStyle,
    "--tree-indent": `${indent}px`,
  } as React.CSSProperties;

  return (
    <TreeContext.Provider value={{ indent, tree }}>
      <div
        data-slot="tree"
        style={mergedStyle}
        className={cn("flex flex-col", className)}
        {...otherProps}
      />
    </TreeContext.Provider>
  );
}

interface TreeItemProps<T> extends React.HTMLAttributes<HTMLButtonElement> {
  item: ItemInstance<T>;
  indent?: number;
  asChild?: boolean;
}

function TreeItem<T>({
  item,
  className,
  asChild,
  children,
  ...props
}: Omit<TreeItemProps<T>, "indent">) {
  const { indent } = useTreeContext<T>();

  const itemProps = typeof item.getProps === "function" ? item.getProps() : {};
  const mergedProps = { ...props, ...itemProps };

  // Extract style from mergedProps to merge with our custom styles
  const { style: propStyle, ...otherProps } = mergedProps;

  // Merge styles
  const mergedStyle = {
    ...propStyle,
    "--tree-padding": `${item.getItemMeta().level * indent + 0}px`,
  } as React.CSSProperties;

  const Comp = asChild ? Slot.Root : "button";

  return (
    <TreeContext.Provider value={{ indent, currentItem: item }}>
      <Comp
        data-slot="tree-item"
        style={mergedStyle}
        className={cn(
          "z-10 ps-(--tree-padding) outline-hidden select-none not-last:pb-0.5 focus:z-20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className,
        )}
        data-focus={
          typeof item.isFocused === "function"
            ? item.isFocused() || false
            : undefined
        }
        data-folder={
          typeof item.isFolder === "function"
            ? item.isFolder() || false
            : undefined
        }
        data-selected={
          typeof item.isSelected === "function"
            ? item.isSelected() || false
            : undefined
        }
        data-drag-target={
          typeof item.isDragTarget === "function"
            ? item.isDragTarget() || false
            : undefined
        }
        data-search-match={
          typeof item.isMatchingSearch === "function"
            ? item.isMatchingSearch() || false
            : undefined
        }
        aria-expanded={item.isExpanded()}
        {...otherProps}
      >
        {children}
      </Comp>
    </TreeContext.Provider>
  );
}

interface TreeItemChevronProps<T>
  extends React.HTMLAttributes<HTMLSpanElement> {
  item?: ItemInstance<T>;
}

function TreeItemChevron<T>({
  item: propItem,
  children,
  className,
  ...props
}: TreeItemChevronProps<T>) {
  const { currentItem } = useTreeContext<T>();
  const item = propItem ?? currentItem;

  if (!item) {
    console.warn("TreeItemChevron: No item provided via props or context");
    return null;
  }

  const isExpanded = item.isExpanded();
  const hasChildren = item.getChildren().length > 0;

  return (
    <div className="flex size-10 shrink-0 items-center justify-center bg-background">
      <Button
        variant="ghost"
        type="button"
        tabIndex={-1}
        aria-label={isExpanded ? "Collapse" : "Expand"}
        className={cn(
          "flex size-8 items-center justify-center bg-background p-0! transition-transform",
          isExpanded ? "rotate-0" : "-rotate-90",
          !hasChildren && "pointer-events-none opacity-50",
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (isExpanded) {
            item.collapse();
          } else {
            item.expand();
          }
        }}
      >
        <ChevronDownIcon
          className={cn("size-4 text-muted-foreground", {
            "text-muted-foreground/50": item.getChildren().length === 0,
          })}
        />
      </Button>
    </div>
  );
}

interface TreeItemLabelProps<T> extends React.HTMLAttributes<HTMLSpanElement> {
  item?: ItemInstance<T>;
}

function TreeItemLabel<T>({
  item: propItem,
  children,
  className,
  ...props
}: TreeItemLabelProps<T>) {
  const { currentItem } = useTreeContext<T>();
  const item = propItem ?? currentItem;

  if (!item) {
    console.warn("TreeItemLabel: No item provided via props or context");
    return null;
  }

  return (
    <span
      data-slot="tree-item-label"
      className={cn(
        "flex h-10 items-center gap-1 rounded-sm bg-background px-2 py-1.5 text-base transition-colors not-in-data-[folder=true]:ps-7 hover:bg-accent in-focus-visible:ring-[3px] in-focus-visible:ring-ring/50 in-data-[drag-target=true]:bg-accent in-data-[search-match=true]:bg-blue-50! in-data-[selected=true]:bg-accent in-data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children ??
        (typeof item.getItemName === "function" ? item.getItemName() : null)}
    </span>
  );
}

function TreeDragLine({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { tree } = useTreeContext();

  if (!tree || typeof tree.getDragLineStyle !== "function") {
    console.warn(
      "TreeDragLine: No tree provided via context or tree does not have getDragLineStyle method",
    );
    return null;
  }

  const dragLine = tree.getDragLineStyle();
  return (
    <div
      style={dragLine}
      className={cn(
        "absolute z-30 -mt-px h-0.5 w-[unset] bg-primary before:absolute before:-top-[3px] before:left-0 before:size-2 before:rounded-full before:border-2 before:border-primary before:bg-background",
        className,
      )}
      {...props}
    />
  );
}

export { Tree, TreeItem, TreeItemChevron, TreeItemLabel, TreeDragLine };
