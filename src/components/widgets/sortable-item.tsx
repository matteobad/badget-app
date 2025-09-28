import type React from "react";
import { useSortable } from "@dnd-kit/react/sortable";

interface Props {
  id: string;
  index: number;
  children: React.ReactNode;
}

export function SortableItem({ id, index, children }: Props) {
  const { ref, isDragging } = useSortable({
    disabled: id === "insights",
    id,
    index,
  });

  return (
    <div ref={ref} data-id={index} data-dragging={isDragging}>
      {children}
    </div>
  );
}
