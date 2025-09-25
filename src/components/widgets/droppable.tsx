import type React from "react";
import { useDroppable } from "@dnd-kit/react";
import { cn } from "~/lib/utils";

interface DroppableGridProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function DroppableGrid({ id, children, className }: DroppableGridProps) {
  const droppable = useDroppable({
    id,
  });

  return (
    <div ref={droppable.ref} className={cn("transition-colors", className)}>
      {children}
    </div>
  );
}
