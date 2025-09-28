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
    transition: {
      duration: 0, // Animation duration in ms
      easing: "cubic-bezier(0.25, 1, 0.5, 1)", // Animation easing
      idle: false, // Whether to animate when no drag is in progress
    },
  });

  return (
    <div ref={ref} data-id={index} data-dragging={isDragging}>
      {children}
    </div>
  );
}
