import type React from "react";
import { useSortable } from "@dnd-kit/react/sortable";

interface Props {
  id: string;
  index: number;
  children: React.ReactNode;
}

export function SortableItem({ id, index, children }: Props) {
  const sortable = useSortable({
    disabled: id === "insights",
    id,
    index,
  });

  return (
    <div ref={sortable.ref} data-id={index}>
      {children}
    </div>
  );
}
