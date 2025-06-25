"use client";

import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "~/lib/utils";
import { cva } from "class-variance-authority";
import { ChevronRight } from "lucide-react";

const treeVariants = cva(
  "group hover:before:opacity-100 before:absolute before:rounded-lg before:left-0 px-2 before:w-full before:opacity-0 before:bg-accent/70 before:h-[2rem] before:-z-10",
);

const selectedTreeVariants = cva(
  "before:opacity-100 before:bg-accent/70 text-accent-foreground",
);

const dragOverVariants = cva(
  "before:opacity-100 before:bg-primary/20 text-primary-foreground",
);

interface TreeDataItem<T> {
  id: string;
  data: T;
  name: string;
  icon?: any;
  selectedIcon?: any;
  openIcon?: any;
  children?: TreeDataItem<T>[];
  actions?: React.ReactNode;
  onClick?: () => void;
  draggable?: boolean;
  droppable?: boolean;
  disabled?: boolean;
}

// TODO: create a custom hook that given an array of data returns the TreeDataItem<T>[]

type TreeProps<T> = React.HTMLAttributes<HTMLDivElement> & {
  data: TreeDataItem<T>[] | TreeDataItem<T>;
  initialSelectedItemId?: string;
  onSelectChange?: (item: TreeDataItem<T> | undefined) => void;
  expandAll?: boolean;
  defaultNodeIcon?: any;
  defaultLeafIcon?: any;
  onDocumentDrag?: (
    sourceItem: TreeDataItem<T>,
    targetItem: TreeDataItem<T>,
  ) => void;
};

function TreeView<T>({
  data,
  initialSelectedItemId,
  onSelectChange,
  expandAll,
  defaultLeafIcon,
  defaultNodeIcon,
  className,
  onDocumentDrag,
  ...props
}: TreeProps<T> & React.ComponentProps<"div">) {
  const [selectedItemId, setSelectedItemId] = React.useState<
    string | undefined
  >(initialSelectedItemId);

  const [draggedItem, setDraggedItem] = React.useState<TreeDataItem<T> | null>(
    null,
  );

  const handleSelectChange = React.useCallback(
    (item: TreeDataItem<T> | undefined) => {
      setSelectedItemId(item?.id);
      if (onSelectChange) {
        onSelectChange(item);
      }
    },
    [onSelectChange],
  );

  const handleDragStart = React.useCallback((item: TreeDataItem<T>) => {
    setDraggedItem(item);
  }, []);

  const handleDrop = React.useCallback(
    (targetItem: TreeDataItem<T>) => {
      if (draggedItem && onDocumentDrag && draggedItem.id !== targetItem.id) {
        onDocumentDrag(draggedItem, targetItem);
      }
      setDraggedItem(null);
    },
    [draggedItem, onDocumentDrag],
  );

  const expandedItemIds = React.useMemo(() => {
    if (!initialSelectedItemId) {
      return [] as string[];
    }

    const ids: string[] = [];

    function walkTreeItems(
      items: TreeDataItem<T>[] | TreeDataItem<T>,
      targetId: string,
    ) {
      if (items instanceof Array) {
        for (let i = 0; i < items.length; i++) {
          ids.push(items[i]!.id);
          if (walkTreeItems(items[i]!, targetId) && !expandAll) {
            return true;
          }
          if (!expandAll) ids.pop();
        }
      } else if (!expandAll && items.id === targetId) {
        return true;
      } else if (items.children) {
        return walkTreeItems(items.children, targetId);
      }
    }

    walkTreeItems(data, initialSelectedItemId);
    return ids;
  }, [data, expandAll, initialSelectedItemId]);

  return (
    <div className={cn("relative z-0 overflow-hidden p-2", className)}>
      <TreeItem
        data={data}
        selectedItemId={selectedItemId}
        handleSelectChange={handleSelectChange}
        expandedItemIds={expandedItemIds}
        defaultLeafIcon={defaultLeafIcon}
        defaultNodeIcon={defaultNodeIcon}
        handleDragStart={handleDragStart}
        handleDrop={handleDrop}
        draggedItem={draggedItem}
        {...props}
      />
      <div
        className="h-[48px] w-full"
        onDrop={(e) => {
          handleDrop({ id: "", name: "parent_div" });
        }}
      ></div>
    </div>
  );
}

type TreeItemProps<T> = TreeProps<T> & {
  selectedItemId?: string;
  handleSelectChange: (item: TreeDataItem<T> | undefined) => void;
  expandedItemIds: string[];
  defaultNodeIcon?: any;
  defaultLeafIcon?: any;
  handleDragStart?: (item: TreeDataItem<T>) => void;
  handleDrop?: (item: TreeDataItem<T>) => void;
  draggedItem: TreeDataItem<T> | null;
};

function TreeItem<T>({
  className,
  data,
  selectedItemId,
  handleSelectChange,
  expandedItemIds,
  defaultNodeIcon,
  defaultLeafIcon,
  handleDragStart,
  handleDrop,
  draggedItem,
  ...props
}: TreeItemProps<T> & React.ComponentProps<"div">) {
  if (!(data instanceof Array)) {
    data = [data];
  }
  return (
    <div role="tree" className={className} {...props}>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            {item.children && item.children.length > 0 ? (
              <TreeNode
                item={item}
                selectedItemId={selectedItemId}
                expandedItemIds={expandedItemIds}
                handleSelectChange={handleSelectChange}
                defaultNodeIcon={defaultNodeIcon}
                defaultLeafIcon={defaultLeafIcon}
                handleDragStart={handleDragStart}
                handleDrop={handleDrop}
                draggedItem={draggedItem}
              />
            ) : (
              <TreeLeaf
                item={item}
                selectedItemId={selectedItemId}
                handleSelectChange={handleSelectChange}
                defaultLeafIcon={defaultLeafIcon}
                handleDragStart={handleDragStart}
                handleDrop={handleDrop}
                draggedItem={draggedItem}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TreeNode<T>({
  item,
  handleSelectChange,
  expandedItemIds,
  selectedItemId,
  defaultNodeIcon,
  defaultLeafIcon,
  handleDragStart,
  handleDrop,
  draggedItem,
}: {
  item: TreeDataItem<T>;
  handleSelectChange: (item: TreeDataItem<T> | undefined) => void;
  expandedItemIds: string[];
  selectedItemId?: string;
  defaultNodeIcon?: any;
  defaultLeafIcon?: any;
  handleDragStart?: (item: TreeDataItem<T>) => void;
  handleDrop?: (item: TreeDataItem<T>) => void;
  draggedItem: TreeDataItem<T> | null;
}) {
  const [value, setValue] = React.useState(
    expandedItemIds.includes(item.id) ? [item.id] : [],
  );
  const [isDragOver, setIsDragOver] = React.useState(false);

  const onDragStart = (e: React.DragEvent) => {
    if (!item.draggable) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", item.id);
    handleDragStart?.(item);
  };

  const onDragOver = (e: React.DragEvent) => {
    if (item.droppable !== false && draggedItem && draggedItem.id !== item.id) {
      e.preventDefault();
      setIsDragOver(true);
    }
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleDrop?.(item);
  };

  return (
    <AccordionPrimitive.Root
      type="multiple"
      value={value}
      onValueChange={(s) => setValue(s)}
    >
      <AccordionPrimitive.Item value={item.id}>
        <AccordionTrigger
          className={cn(
            treeVariants(),
            selectedItemId === item.id && selectedTreeVariants(),
            isDragOver && dragOverVariants(),
          )}
          onClick={() => {
            handleSelectChange(item);
            item.onClick?.();
          }}
          draggable={!!item.draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <TreeIcon
            item={item}
            isSelected={selectedItemId === item.id}
            isOpen={value.includes(item.id)}
            default={defaultNodeIcon}
          />
          <span className="truncate text-sm">{item.name}</span>
          <TreeActions isSelected={selectedItemId === item.id}>
            {item.actions}
          </TreeActions>
        </AccordionTrigger>
        <AccordionContent className="ml-4 border-l pl-1">
          <TreeItem
            data={item.children ? item.children : item}
            selectedItemId={selectedItemId}
            handleSelectChange={handleSelectChange}
            expandedItemIds={expandedItemIds}
            defaultLeafIcon={defaultLeafIcon}
            defaultNodeIcon={defaultNodeIcon}
            handleDragStart={handleDragStart}
            handleDrop={handleDrop}
            draggedItem={draggedItem}
          />
        </AccordionContent>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  );
}

function TreeLeaf<T>({
  className,
  item,
  selectedItemId,
  handleSelectChange,
  defaultLeafIcon,
  handleDragStart,
  handleDrop,
  draggedItem,
  ...props
}: {
  item: TreeDataItem<T>;
  selectedItemId?: string;
  handleSelectChange: (item: TreeDataItem<T> | undefined) => void;
  defaultLeafIcon?: any;
  handleDragStart?: (item: TreeDataItem<T>) => void;
  handleDrop?: (item: TreeDataItem<T>) => void;
  draggedItem: TreeDataItem<T> | null;
} & React.ComponentProps<"div">) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const onDragStart = (e: React.DragEvent) => {
    if (!item.draggable || item.disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", item.id);
    handleDragStart?.(item);
  };

  const onDragOver = (e: React.DragEvent) => {
    if (
      item.droppable !== false &&
      !item.disabled &&
      draggedItem &&
      draggedItem.id !== item.id
    ) {
      e.preventDefault();
      setIsDragOver(true);
    }
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    if (item.disabled) return;
    e.preventDefault();
    setIsDragOver(false);
    handleDrop?.(item);
  };

  return (
    <div
      className={cn(
        "ml-5 flex cursor-pointer items-center py-2 text-left before:right-1",
        treeVariants(),
        className,
        selectedItemId === item.id && selectedTreeVariants(),
        isDragOver && dragOverVariants(),
        item.disabled && "pointer-events-none cursor-not-allowed opacity-50",
      )}
      onClick={() => {
        if (item.disabled) return;
        handleSelectChange(item);
        item.onClick?.();
      }}
      draggable={!!item.draggable && !item.disabled}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      {...props}
    >
      <TreeIcon
        item={item}
        isSelected={selectedItemId === item.id}
        default={defaultLeafIcon}
      />
      <span className="flex-grow truncate text-sm">{item.name}</span>
      <TreeActions isSelected={selectedItemId === item.id && !item.disabled}>
        {item.actions}
      </TreeActions>
    </div>
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        className={cn(
          "flex w-full flex-1 items-center py-2 transition-all first:[&[data-state=open]>svg]:rotate-90",
          className,
        )}
        {...props}
      >
        <ChevronRight className="mr-1 h-4 w-4 shrink-0 text-accent-foreground/50 transition-transform duration-200" />
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className,
      )}
      {...props}
    >
      <div className="pt-0 pb-1">{children}</div>
    </AccordionPrimitive.Content>
  );
}

function TreeIcon<T>({
  item,
  isOpen,
  isSelected,
  default: defaultIcon,
}: {
  item: TreeDataItem<T>;
  isOpen?: boolean;
  isSelected?: boolean;
  default?: any;
}) {
  let Icon = defaultIcon;
  if (isSelected && item.selectedIcon) {
    Icon = item.selectedIcon;
  } else if (isOpen && item.openIcon) {
    Icon = item.openIcon;
  } else if (item.icon) {
    Icon = item.icon;
  }
  return Icon ? <Icon className="mr-2 h-4 w-4 shrink-0" /> : <></>;
}

function TreeActions({
  children,
  isSelected,
}: {
  children: React.ReactNode;
  isSelected: boolean;
}) {
  return (
    <div
      className={cn(
        isSelected ? "block" : "hidden",
        "absolute right-3 group-hover:block",
      )}
    >
      {children}
    </div>
  );
}

export { TreeView, type TreeDataItem };
