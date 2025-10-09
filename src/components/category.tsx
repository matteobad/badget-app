"use client";

import type { dynamicIconImports } from "lucide-react/dynamic";
import { DynamicIcon } from "lucide-react/dynamic";
import { cn } from "~/lib/utils";

type CategoryIconProps = {
  color?: string;
  size?: number;
  className?: string;
};

export function CategoryColor({
  color,
  className,
  size = 12,
}: CategoryIconProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: color,
        width: size,
        height: size,
      }}
    />
  );
}

type Props = {
  name: string;
  className?: string;
  color?: string;
  icon?: keyof typeof dynamicIconImports;
};

export function Category({ name, color, icon, className }: Props) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <CategoryColor color={color} />
      {icon && <DynamicIcon name={icon} />}
      {name && <span>{name}</span>}
    </div>
  );
}
